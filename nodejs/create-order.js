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

const createOrder = async (orderData) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: projectAuth,
    },
    body: JSON.stringify(orderData),
  };

  try {
    const response = await fetch(`${baseUrl}/v1/orders?project=${projectName}`, options);

    const data = await response.json();

    switch (response.status) {
      case 201:
        return data;

      case 400:
        throw new Error(data.message);

      default:
        throw new Error('Unknown Error');
    }
  } catch (err) {
    console.error(err);
  }
};

(async () => {
  const contactInformation = {
    email: 'john-smith@teemill.com',
    phone: '+442087599036',
  };

  const shippingAddress = {
    contactName: 'John Smith',
    company: '',
    line1: '35 South St',
    line2: '',
    city: 'Newport',
    postalCode: 'PO30 1JE',
    country: 'GB',
    state: 'Isle of Wight',
  };

  const shippingPrompt = new enquirer.Form({
    name: 'shipping',
    message: 'Please provide your shipping details:',
    choices: [
      { name: 'name', message: 'Full Name', initial: shippingAddress.contactName },
      { name: 'email', message: 'Email', initial: contactInformation.email },
      { name: 'phone', message: 'Phone', initial: contactInformation.phone },
      { name: 'line1', message: 'Line 1', initial: shippingAddress.line1 },
      { name: 'line2', message: 'Line 2', initial: shippingAddress.line2 },
      { name: 'postalCode', message: 'Post Code', initial: shippingAddress.postalCode },
      { name: 'city', message: 'City', initial: shippingAddress.city },
      { name: 'country', message: 'Country', initial: shippingAddress.country },
      { name: 'state', message: 'State', initial: shippingAddress.state },
    ]
  });

  const details = await shippingPrompt.run();

  // Update Contact Information
  contactInformation.email = details.email;
  contactInformation.phone = details.phone;

  // Update Shipping Address
  shippingAddress.contactName = details.name;
  shippingAddress.line1 = details.line1;
  shippingAddress.line2 = details.line2;
  shippingAddress.city = details.city;
  shippingAddress.postalCode = details.postalCode;
  shippingAddress.country = details.country;
  shippingAddress.state = details.state;

  const itemPrompt = new enquirer.Input({
    message: 'Please enter your variant ref:',
    initial: 'https://api.teemill.com/v1/variants/97e0899b-ae5a-4d64-a0b8-3518728d89f6'
  });

  const item = await itemPrompt.run();

  const orderData = {
    contactInformation,
    shippingAddress,
    items: [{
      variantRef: item,
      quantity: 1,
    }],
  };

  console.log('✨ Order Details');
  console.dir(orderData);

  const confirmPrompt = new enquirer.Toggle({
    message: 'Create order with these details?',
    enabled: 'Yes',
    disabled: 'No'
  });

  if (await confirmPrompt.run()) {
    const spinner = ora('Creating Order...').start();
    const order = await createOrder(orderData);
    spinner.stop();

    console.log('✔ Order Created');
    console.dir(order, { depth: null });
  } else {
    console.log('❌ Canceled');
  }
})();
