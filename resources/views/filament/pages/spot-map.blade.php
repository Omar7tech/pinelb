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

        <div
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

                /** The pointer's position over the map, as a percentage of its box. */
                coords(event) {
                    const rect = this.$refs.map.getBoundingClientRect();
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
                    this.armedId = this.armedId === id ? null : id;
                },

                /** Clicking the map drops the armed spot's pin. */
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

                startDrag(id, event) {
                    event.preventDefault();
                    this.dragId = id;
                    this.moved = false;
                },

                onPointerMove(event) {
                    if (this.dragId === null) {
                        return;
                    }

                    event.preventDefault();
                    this.moved = true;
                    this.placePin(this.dragId, event);
                },

                /** A drag that moved swallows the click that follows it. */
                onPointerUp() {
                    if (this.dragId === null) {
                        return;
                    }

                    this.justDragged = this.moved;
                    this.dragId = null;
                },

                pinColor(spot) {
                    if (! spot.is_active) {
                        return '#6b7280';
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
            x-on:pointermove.window="onPointerMove($event)"
            x-on:pointerup.window="onPointerUp()"
            style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 1rem;"
        >
            <div style="flex: 1 1 26rem; min-width: 0;">
                <div
                    x-ref="map"
                    x-on:click="mapClick($event)"
                    x-bind:style="armedId !== null ? 'cursor: crosshair;' : ''"
                    style="position: relative; overflow: hidden; border-radius: 0.75rem; border: 1px solid rgba(120, 137, 108, 0.35); touch-action: none;"
                >
                    <img
                        src="{{ $this->mapImageUrl }}"
                        alt="Spot map"
                        draggable="false"
                        style="display: block; width: 100%; height: auto; user-select: none; pointer-events: none;"
                    >

                    <template x-for="spot in placedSpots()" :key="spot.id">
                        <button
                            type="button"
                            x-on:pointerdown="startDrag(spot.id, $event)"
                            x-bind:title="spot.name"
                            x-bind:style="`
                                position: absolute;
                                left: ${positions[spot.id].x}%;
                                top: ${positions[spot.id].y}%;
                                transform: translate(-50%, -50%);
                                display: inline-flex;
                                align-items: center;
                                gap: 0.375rem;
                                padding: 0.25rem 0.5rem 0.25rem 0.3rem;
                                border-radius: 9999px;
                                border: 1px solid ${pinColor(spot)};
                                background: rgba(255, 255, 255, 0.92);
                                color: #1f2937;
                                font-size: 0.75rem;
                                line-height: 1;
                                white-space: nowrap;
                                cursor: grab;
                                touch-action: none;
                                box-shadow: 0 6px 14px -8px rgba(15, 23, 42, 0.8);
                            `"
                        >
                            <span
                                x-bind:style="`display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: ${pinColor(spot)};`"
                            ></span>
                            <span x-text="spot.name"></span>
                        </button>
                    </template>
                </div>

                <p style="margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.7;">
                    <span x-show="armedId === null">Drag a pin to move it, or pick a spot on the right to place it.</span>
                    <span x-show="armedId !== null" x-cloak>
                        Click the map to place
                        <strong x-text="spots.find((spot) => spot.id === armedId)?.name"></strong>.
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
                                <span x-text="spot.name"></span>
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
                            <div
                                style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.875rem;"
                            >
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
