/** What the customer must provide before an order can be sent. */
export type Checkout = {
    requireFullName: boolean;
    requirePhoneNumber: boolean;
    getClientLocation: boolean;
};
