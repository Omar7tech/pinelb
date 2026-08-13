<x-filament-panels::page>
    @if ($this->mapImageUrl === null)
        <x-filament::section>
            <x-slot name="heading">No map uploaded yet</x-slot>

            <p>
                Upload the plan under
                <a href="{{ \App\Filament\Pages\ManageReservations::getUrl() }}" style="text-decoration: underline;">
                    Reservation settings → Spot map
                </a>, then come back here to place each spot on it.
            </p>
        </x-filament::section>
    @else
        @unless ($this->mapIsActive)
            <x-filament::section>
                <x-slot name="heading">The map view is switched off</x-slot>

                <p>
                    Arrange the layout here as much as you like — customers won't see the map until
                    <a href="{{ \App\Filament\Pages\ManageReservations::getUrl() }}" style="text-decoration: underline;">
                        the map view is enabled
                    </a>.
                </p>
            </x-filament::section>
        @endunless

        {{-- The layout lives in the browser until it's saved, so the re-render
             that follows a save must not morph the arranged pins back to what
             the server last knew. --}}
        <div
            wire:ignore
            x-data="{
                spots: @js($this->spots),
                positions: @js((object) $this->positions),
                armedId: null,
                dragId: null,
                moved: false,
                justDragged: false,
                dirty: false,
                saving: false,

                isPlaced(id) {
                    return this.positions[id] !== undefined;
                },

                placedSpots() {
                    return this.spots.filter((spot) => this.isPlaced(spot.id));
                },

                unplacedSpots() {
                    return this.spots.filter((spot) => ! this.isPlaced(spot.id));
                },

                spotName(id) {
                    return this.spots.find((spot) => spot.id === id)?.name ?? '';
                },

                /**
                 * The pointer's position as a percentage of the image box — the
                 * same frame of reference the storefront reads the pins in.
                 */
                coords(event) {
                    const rect = this.$refs.image.getBoundingClientRect();
                    const clamp = (value) => Math.min(100, Math.max(0, Math.round(value * 100) / 100));

                    return {
                        x: clamp(((event.clientX - rect.left) / rect.width) * 100),
                        y: clamp(((event.clientY - rect.top) / rect.height) * 100),
                    };
                },

                placePin(id, event) {
                    this.positions = { ...this.positions, [id]: this.coords(event) };
                    this.dirty = true;
                },

                removePin(id) {
                    const next = { ...this.positions };
                    delete next[id];
                    this.positions = next;
                    this.dirty = true;
                },

                arm(id) {
                    // A drag before this one must not swallow the placing click.
                    this.justDragged = false;
                    this.armedId = this.armedId === id ? null : id;
                },

                /** Clicking the plan drops the armed spot's pin. */
                mapClick(event) {
                    if (this.justDragged) {
                        this.justDragged = false;

                        return;
                    }

                    if (this.armedId === null) {
                        return;
                    }

                    this.placePin(this.armedId, event);
                    this.armedId = null;
                },

                /**
                 * The pin captures the pointer, so every move lands on it — the
                 * marker follows the cursor even when it runs off the plan.
                 */
                startDrag(id, event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    this.dragId = id;
                    this.moved = false;
                },

                drag(event) {
                    if (this.dragId === null) {
                        return;
                    }

                    event.preventDefault();
                    this.moved = true;
                    this.placePin(this.dragId, event);
                },

                endDrag(event) {
                    if (this.dragId === null) {
                        return;
                    }

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                    }

                    // A drag that moved swallows the click that follows it.
                    this.justDragged = this.moved;
                    this.dragId = null;
                },

                pinColor(spot) {
                    if (! spot.is_active) {
                        return '#6b7280';
                    }

                    // A colour set on the spot wins; otherwise the pin reads
                    // its state, as it does on the storefront.
                    if (spot.pin_color) {
                        return spot.pin_color;
                    }

                    return spot.is_reserved ? '#b91c1c' : '#78896c';
                },

                async save() {
                    this.saving = true;
                    await this.$wire.saveLayout(this.positions);
                    this.dirty = false;
                    this.saving = false;
                },
            }"
            style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 1rem;"
        >
            <div style="flex: 1 1 26rem; min-width: 0;">
                <div
                    style="display: flex; justify-content: center; overflow: hidden; border-radius: 0.75rem; border: 1px solid rgba(120, 137, 108, 0.35); background: rgba(120, 137, 108, 0.06);"
                >
                    {{-- The wrapper hugs the image, so a pin's percentage is
                         always read against the plan itself. --}}
                    <div style="position: relative; display: inline-block; line-height: 0;">
                        <img
                            x-ref="image"
                            x-on:click="mapClick($event)"
                            x-bind:style="armedId !== null ? 'cursor: crosshair;' : ''"
                            src="{{ $this->mapImageUrl }}"
                            alt="Spot map"
                            draggable="false"
                            style="display: block; max-width: 100%; max-height: 70vh; width: auto; height: auto; user-select: none; touch-action: none;"
                        >

                        {{-- Every spot keeps its own marker in the DOM and the
                             unplaced ones are simply hidden. Removing a pin and
                             dropping it again then updates the same element,
                             rather than rebuilding one that could come back
                             carrying its old position. --}}
                        <template x-for="spot in spots" :key="spot.id">
                            <button
                                type="button"
                                x-on:pointerdown="startDrag(spot.id, $event)"
                                x-on:pointermove="drag($event)"
                                x-on:pointerup="endDrag($event)"
                                x-on:pointercancel="endDrag($event)"
                                x-bind:title="spot.name"
                                x-bind:aria-label="spot.name"
                                x-bind:style="`
                                    display: ${isPlaced(spot.id) ? 'block' : 'none'};
                                    position: absolute;
                                    left: ${positions[spot.id]?.x ?? 0}%;
                                    top: ${positions[spot.id]?.y ?? 0}%;
                                    transform: translate(-50%, -50%);
                                    width: 0.75rem;
                                    height: 0.75rem;
                                    padding: 0;
                                    border: 0;
                                    border-radius: 9999px;
                                    background: ${pinColor(spot)};
                                    box-shadow: 0 0 0 2px #ffffff, 0 2px 5px rgba(15, 23, 42, 0.45);
                                    cursor: ${dragId === spot.id ? 'grabbing' : 'grab'};
                                    touch-action: none;
                                `"
                            >
                                {{-- The same marker the storefront draws: the
                                     dot on the point, its name under it, so both
                                     views agree. The name hangs off the dot
                                     rather than sitting in its flow, so a long
                                     one can't drag the dot off the point. --}}
                                <span
                                    x-text="spot.name"
                                    style="
                                        position: absolute;
                                        top: 100%;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        margin-top: 0.25rem;
                                        padding: 0.0625rem 0.375rem;
                                        border-radius: 9999px;
                                        background: rgba(255, 255, 255, 0.85);
                                        color: #18181b;
                                        font-size: 0.625rem;
                                        font-weight: 500;
                                        line-height: 1.4;
                                        white-space: nowrap;
                                        pointer-events: none;
                                    "
                                ></span>
                            </button>
                        </template>
                    </div>
                </div>

                <p style="margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75;">
                    <span x-show="armedId === null && dragId === null">
                        Drag a pin to move it, or pick a spot on the right and click the plan to place it.
                    </span>
                    <span x-show="armedId !== null" x-cloak>
                        Click the plan to place <strong x-text="spotName(armedId)"></strong>.
                    </span>
                    <span x-show="dragId !== null" x-cloak>
                        <strong x-text="spotName(dragId)"></strong>
                        at <span x-text="positions[dragId]?.x"></span>%,
                        <span x-text="positions[dragId]?.y"></span>%
                    </span>
                </p>
            </div>

            <aside style="flex: 1 1 16rem; display: flex; flex-direction: column; gap: 1rem;">
                <x-filament::section>
                    <x-slot name="heading">To place</x-slot>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <template x-for="spot in unplacedSpots()" :key="spot.id">
                            <button
                                type="button"
                                x-on:click="arm(spot.id)"
                                x-bind:style="`
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    gap: 0.5rem;
                                    padding: 0.5rem 0.75rem;
                                    border-radius: 0.5rem;
                                    border: 1px solid ${armedId === spot.id ? '#78896c' : 'rgba(120, 137, 108, 0.35)'};
                                    background: ${armedId === spot.id ? 'rgba(120, 137, 108, 0.15)' : 'transparent'};
                                    font-size: 0.875rem;
                                    text-align: start;
                                    cursor: pointer;
                                `"
                            >
                                <span style="display: inline-flex; align-items: center; gap: 0.5rem; min-width: 0;">
                                    {{-- The same dot the placed list shows, so
                                         a spot is recognised by its colour
                                         before it reaches the plan. --}}
                                    <span
                                        x-bind:style="`display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: ${pinColor(spot)}; flex: none;`"
                                    ></span>
                                    <span x-text="spot.name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                                </span>
                                <span
                                    x-show="! spot.is_active"
                                    x-cloak
                                    style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6;"
                                >Hidden</span>
                            </button>
                        </template>

                        <p x-show="unplacedSpots().length === 0" x-cloak style="font-size: 0.875rem; opacity: 0.7;">
                            Every spot is on the map.
                        </p>
                    </div>
                </x-filament::section>

                <x-filament::section>
                    <x-slot name="heading">On the map</x-slot>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <template x-for="spot in placedSpots()" :key="spot.id">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.875rem;">
                                <span style="display: inline-flex; align-items: center; gap: 0.5rem; min-width: 0;">
                                    <span
                                        x-bind:style="`display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: ${pinColor(spot)};`"
                                    ></span>
                                    <span x-text="spot.name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                                </span>

                                <button
                                    type="button"
                                    x-on:click="removePin(spot.id)"
                                    style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #b91c1c; cursor: pointer;"
                                >
                                    Remove
                                </button>
                            </div>
                        </template>

                        <p x-show="placedSpots().length === 0" x-cloak style="font-size: 0.875rem; opacity: 0.7;">
                            No spots placed yet.
                        </p>
                    </div>
                </x-filament::section>

                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <x-filament::button
                        x-on:click="save()"
                        x-bind:disabled="! dirty || saving"
                    >
                        <span x-show="! saving">Save layout</span>
                        <span x-show="saving" x-cloak>Saving…</span>
                    </x-filament::button>

                    <span x-show="dirty" x-cloak style="font-size: 0.75rem; opacity: 0.7;">Unsaved changes</span>
                </div>
            </aside>
        </div>
    @endif
</x-filament-panels::page>
