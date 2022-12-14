# Nodejs Examples
Examples of using the Teemill API in Nodejs

*Following examples will require you to have [nodejs](https://nodejs.org/en/) installed!

## Get Started
1) Clone the api-demos repository.
    ```bash
    > git clone https://github.com/Teemill/api-demos.git
    ```
2) Cd into the nodejs demos directory.
    ```bash
    > cd nodejs
    ```
3) Install the npm dependencies we need for the demos.
    ```bash
    > npm install
    ```

## List Products
List your first 10 products with each available variant.
1) Run demo
    ```bash
    > node ./list-products.js --project=<project> --auth-key=<private-key>
    ```

## Create Order
Create and submit a new order
1) Run demo
    ```bash
    > node ./create-order.js --project=<project> --auth-key=<private-key>
    ```
2) Enter your contact and address details
3) Enter the reference to the variant you wish to create an order for (Can be found by using list projects)
4) Review the order details
5) Create the order

## Confirm Order
1) Run demo
    ```bash
    > node ./confirm-order.js --project=<project> --auth-key=<private-key>
    ```
2) Enter the reference to the order you wish to confirm (Can be found in the response of create order)
3) Select a shipping method for each fulfillment in the order
4) Review the order details
5) Confirm the order (This will charge your account and start processing the order)