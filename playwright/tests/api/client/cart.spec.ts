import { expectOkCartResponse, expectOkOrderResponse, expectOkProductResponse } from '../../../assertions/api-response.assertions';
import { expectOrderToMatchCart, expectOrderToMatchCheckoutDetails } from '../../../assertions/order.assertions';
import { test } from '../../../fixtures/app.fixture';

test.describe('cart API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('client can add account cart items and pay order', async ({ testContext }) => {
    //given
    const product = await createRandomProduct(testContext, {
      name: `API Account Cart Skate ${Date.now()}`,
      price: 280,
      stock: 3
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(product.id, 1);

    //then
    const cartBeforeCheckout = await expectOkCartResponse(addToCartResponse, [
      { product, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await testContext.api.client.order.checkout(checkoutDetails);

    //then
    const order = await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      ...checkoutDetails
    });

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    //then
    const paidOrder = await expectOkOrderResponse(payResponse, {
      id: order.id,
      status: 'PAID',
      ...checkoutDetails
    });

    //then
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });

  test('fresh client can order product added to account cart before checkout', async ({ testContext }) => {
    //given
    const product = await createRandomProduct(testContext, {
      name: `API Account Cart Before Checkout Skate ${Date.now()}`,
      price: 280,
      stock: 3
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(product.id, 1);

    //then
    await expectOkCartResponse(addToCartResponse, [
      { product, quantity: 1 }
    ]);

    //when
    const cartBeforeCheckoutResponse = await testContext.api.client.cart.getCart();

    //then
    const cartBeforeCheckout = await expectOkCartResponse(cartBeforeCheckoutResponse, [
      { product, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await testContext.api.client.order.checkout(checkoutDetails);

    //then
    const order = await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      ...checkoutDetails
    });

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    //then
    const paidOrder = await expectOkOrderResponse(payResponse, {
      id: order.id,
      status: 'PAID',
      ...checkoutDetails
    });

    //then
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });

  test('fresh client can order account cart product with extra product added before checkout', async ({ testContext }) => {
    //given
    const productSuffix = Date.now();
    const accountProduct = await createRandomProduct(testContext, {
      name: `API Account Cart Skate ${productSuffix}`,
      price: 280,
      stock: 3
    });
    const extraProduct = await createRandomProduct(testContext, {
      name: `API Extra Cart Wheels ${productSuffix}`,
      category: 'ACCESSORIES',
      type: 'WHEELS',
      price: 120,
      stock: 5
    });

    const addAccountProductResponse = await testContext.api.client.cart.addToCart(accountProduct.id, 1);

    //then
    await expectOkCartResponse(addAccountProductResponse, [
      { product: accountProduct, quantity: 1 }
    ]);

    //when
    const oneItemCartResponse = await testContext.api.client.cart.getCart();

    //then
    await expectOkCartResponse(oneItemCartResponse, [
      { product: accountProduct, quantity: 1 }
    ]);

    //when
    const addExtraProductResponse = await testContext.api.client.cart.addToCart(extraProduct.id, 1);

    //then
    await expectOkCartResponse(addExtraProductResponse, [
      { product: accountProduct, quantity: 1 },
      { product: extraProduct, quantity: 1 }
    ]);

    //when
    const cartBeforeCheckoutResponse = await testContext.api.client.cart.getCart();

    //then
    const cartBeforeCheckout = await expectOkCartResponse(cartBeforeCheckoutResponse, [
      { product: accountProduct, quantity: 1 },
      { product: extraProduct, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await testContext.api.client.order.checkout(checkoutDetails);

    //then
    const order = await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      ...checkoutDetails
    });

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    //then
    const paidOrder = await expectOkOrderResponse(payResponse, {
      id: order.id,
      status: 'PAID',
      ...checkoutDetails
    });

    //then
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });
});

async function createRandomProduct(testContext: any, overrides: any) {
  const response = await testContext.api.admin.product.createRandom(overrides);

  //then
  return expectOkProductResponse(response, overrides);
}
