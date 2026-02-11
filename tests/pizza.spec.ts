import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';
import { Page } from '@playwright/test';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

async function basicInit(page: Page) {

  let registeredUser: User | undefined;
  const validNewUsers: Record<string, User> = { 'q@jwt.com': { id: '5', name: 'Generic Name', email: 'q@jwt.com', password: 'q', roles: [{ role: Role.Diner }] } };
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] }, 'a@jwt.com': { id: '1', name: 'Admin Name', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] } };

  await page.route('*/**/api/auth', async (route) => {
    const method = route.request().method();
    const body = route.request().postDataJSON();

    if (method === 'POST') {
      const newUser: User = {
        id: '5',
        name: body.name,
        email: body.email,
        password: body.password,
        roles: [{ role: Role.Diner }],
      };

      validNewUsers[body.email] = newUser;
      validUsers[body.email] = newUser;
      registeredUser = newUser;
      loggedInUser = newUser;

      await route.fulfill({
        status: 200,
        json: { user: newUser, token: 'abcdef' },
      });
      return;
    }

    if (method === 'PUT') {
      const user = validUsers[body.email];
      console.log('Login attempt for:', body.email);
      console.log('User found:', user);
      if (!user || user.password !== body.password) {
        await route.fulfill({
          status: 401,
          json: { error: 'Unauthorized' },
        });
        return;
      }

      loggedInUser = user;

      await route.fulfill({
        status: 200,
        json: { user, token: 'abcdef' },
      });
      return;
    }

    await route.fulfill({
      status: 405,
      json: { error: 'Method not allowed' },
    });
  });

  // await page.route('*/**/api/auth', async (route) => {
  //   const registerReq = route.request().postDataJSON();
  //   const user = validNewUsers[registerReq.email];
  //   if (!user || user.password !== registerReq.password) {
  //     await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
  //     return;
  //   }
  //   registeredUser = user;
  //   const registerRes = {
  //     user: registeredUser,
  //     token: 'abcdef',
  //   };
  //   expect(route.request().method()).toBe('POST');
  //   await route.fulfill({ json: registerRes });
  // });

  // let loggedInUser: User | undefined;
  // const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

  // // Authorize login for the given user
  // await page.route('*/**/api/auth', async (route) => {
  //   const loginReq = route.request().postDataJSON();
  //   const user = validUsers[loginReq.email];
  //   if (!user || user.password !== loginReq.password) {
  //     await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
  //     return;
  //   }
  //   loggedInUser = validUsers[loginReq.email];
  //   const loginRes = {
  //     user: loggedInUser,
  //     token: 'abcdef',
  //   };
  //   expect(route.request().method()).toBe('PUT');
  //   await route.fulfill({ json: loginRes });
  // });


  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // Return the currently registered user
  await page.route('*/**/api/user/registered', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: registeredUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  const mockFranchises = [
  { id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi' }] },
  { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
  { id: 4, name: 'topSpot', stores: [] },
];

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: { franchises: mockFranchises } });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const newFranchise = {
      id: mockFranchises.length + 2, // simple incremental ID
      name: 'Added Franchise',
      stores: [{ id: 8, name: 'Main Store' }],
    };
    mockFranchises.push(newFranchise); // add to the in-memory list
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: newFranchise });
  });

  // Standard franchises and stores
  // await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
  //   const franchiseRes = {
  //     franchises: [
  //       {
  //         id: 2,
  //         name: 'LotaPizza',
  //         stores: [
  //           { id: 4, name: 'Lehi' },
  //           // { id: 5, name: 'Springville' },
  //           // { id: 6, name: 'American Fork' },
  //         ],
  //       },
  //       { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
  //       { id: 4, name: 'topSpot', stores: [] },
  //     ],
  //   };
  //   expect(route.request().method()).toBe('GET');
  //   await route.fulfill({ json: franchiseRes });
  // });

  // // let createdFranchise: any;
  // await page.route('*/**/api/franchise', async (route) => {
  //   const createdFranchise = route.request().postDataJSON();
  //   const newFranchise = {
  //     id: 5,
  //     name: createdFranchise.name,
  //     stores: [{ id: 8, name: createdFranchise.storeName }],
  //   };
  //   expect(route.request().method()).toBe('POST');
  //   await route.fulfill({ json: newFranchise });
  // });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('register', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Generic Name');
  await page.getByRole('textbox', { name: 'Email address' }).fill('q@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('q');
  await page.getByRole('button', { name: 'Register' }).click();


  await expect(page.getByRole('link', { name: 'GN' })).toBeVisible();
});

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('register shows error for invalid email', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Generic Name');
  await page.getByRole('textbox', { name: 'Email address' }).fill('invalid-email');
  await page.getByRole('textbox', { name: 'Password' }).fill('hi');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/register/);

});

test('login shows error for invalid credentials', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('invalid-email');
  await page.getByRole('textbox', { name: 'Password' }).fill('invalid-password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/login/);
});

test('log out', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('admin can login', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

});

test('admin can login and create franchise', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('Some name, does not matter');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  // await page.getByRole('textbox', { name: 'Filter franchises' }).fill('New Franchise');
  // await page.getByRole('button', { name: 'Submit' }).click();

  await page.screenshot({ path: 'admin-create-franchise.png', fullPage: true });

  await expect(page.getByText('Added Franchise')).toBeVisible();
  

});

