{{-- What kind of thing this pin is, read at a glance while the layout is
     arranged: a calendar for a spot customers book, a map pin for a landmark
     they only find their way by. Expects an Alpine `spot` in scope. --}}
<span
    x-bind:title="spot.is_reservable ? 'Bookable spot' : 'Landmark — map only'"
    style="display: inline-flex; flex: none; opacity: 0.7;"
>
    <svg
        x-show="spot.is_reservable"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        style="display: block; width: 0.875rem; height: 0.875rem;"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
    </svg>

    <svg
        x-show="! spot.is_reservable"
        x-cloak
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        style="display: block; width: 0.875rem; height: 0.875rem;"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
    </svg>
</span>
