import ora from 'ora';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { program } from 'commander';

program
  .option('-p, --project <project>')
  .option('-k, --auth-key <key>')
  .parse();

const options = program.opts();

const projectName = options.project;
const projectAuth = options.authKey;

const getProducts = async () => {
  console.log('Get Products');

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: projectAuth,
    },
  };

  try {
    const response = await fetch(`https://api.teemill.com/v1/catalog/products?project=${projectName}`, options)
    const data = await response.json();

    return data.products;
  } catch (err) {
    console.error(err);
  }
};

(async ()=> {
  const spinner = ora('Loading products').start();

  const products = await getProducts();

  spinner.stop();

  products.forEach(product => {
    console.log(
      chalk.bgGreen(' Product '),
      product.title
    );

    product.variants.forEach(variant => {
      console.log(
        chalk.bgBlue(' Variant '),
        ...variant.attributes.flatMap((attribute) => [
          chalk.gray(`${attribute.name}:`),
          chalk.blue(attribute.value),
          '	'
        ]),
        '	',
        chalk.white(variant.ref)
      );
    });
    console.log();
  });
})();
