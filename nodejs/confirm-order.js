import ora from 'ora';
import enquirer from 'enquirer';
import fetch from 'node-fetch';
import { program } from 'commander';

program
  .option('-p, --project <project>')
  .option('-k, --auth-key <key>')
  .parse();

const options = program.opts();

const projectName = options.project;
const projectAuth = options.authKey;
const baseUrl = 'https://api.teemill.com';

const getOrder = async (orderRef) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: projectAuth,
    },
  };

  try {
    const response = await fetch(`${orderRef}?project=${projectName}`, options);

    switch (response.status) {
      case 200:
        return await response.json();

      default:
        throw new Error('Unknown Error');
    }
  } catch (err) {
    console.error(err);
  }
};

const confirmOrder = async (order, confirmationData) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: projectAuth,
    },
    body: JSON.stringify(confirmationData),
  };

  try {
    const response = await fetch(`${baseUrl}/v1/orders/${order.id}/confirm?project=${projectName}`, options);

    switch (response.status) {
      case 200:
        return await response.json();

      case 400:
        throw new Error((await response.json()).message);

      default:
        throw new Error('Unknown Error');
    }
  } catch (err) {
    console.error(err);
  }
};

(async () => {
  const orderPrompt = new enquirer.Input({
    message: 'Please enter your order ref:',
    initial: 'https://api.teemill.com/v1/orders/97f8947d-33c4-44ea-9738-92674d8e83e4'
  });

  const orderRef = await orderPrompt.run();

  const fetchOrderSpinner = ora('Fetching Order...').start();
  const order = await getOrder(orderRef);
  fetchOrderSpinner.stop();

  const confirmationData = await Promise.all(order.fulfillments
    .map(async (fulfillment) => {
      const shippingPrompt = new enquirer.Select({
        name: 'shipping',
        message: 'Please select a shipping method',
        choices: fulfillment.availableShippingMethods.map(s => ({
          value: s.id,
          name: `${s.name} - £${s.totalPrice.amount}`,
        })),
        result(name) {
          return this.find(name, 'value');
        },
      });

      const shippingMethodId = await shippingPrompt.run();

      return {
        fulfillmentId: fulfillment.id,
        shippingMethodId: shippingMethodId,
      };
    })
  );

  console.log('✨ Confirmation Details');
  console.dir(confirmationData);

  const confirmPrompt = new enquirer.Toggle({
    message: 'Confirm order?',
    enabled: 'Yes',
    disabled: 'No'
  });

  if (await confirmPrompt.run()) {
    const spinner = ora('Confirming Order...').start();
    const order = await confirmOrder(confirmationData);
    spinner.stop();

    console.log('✔ Order Confirmed');
    console.dir(order, { depth: null });
  } else {
    console.log('❌ Canceled');
  }
})();
