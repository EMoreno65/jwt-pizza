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

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // Update User
  await page.route('**/api/user/**', async (route) => {
    const req = route.request();
    const method = req.method();

    console.log('Intercepted:', method, req.url());

    if (method === 'PUT') {
      const updateData = req.postDataJSON();

      if (!loggedInUser) {
        await route.fulfill({ status: 401 });
        return;
      }

      const oldEmail = loggedInUser.email || '';

      const updatedUser = {
        ...loggedInUser,
        ...updateData,
      };

      if (updateData.email && updateData.email !== oldEmail) {
        delete validUsers[oldEmail];
        validUsers[updateData.email] = updatedUser;
      } else {
        validUsers[oldEmail] = updatedUser;
      }
      loggedInUser = updatedUser;

      await route.fulfill({
        status: 200,
        json: {
          user: updatedUser,
          token: 'mock-token',
        },
      });
      return;
    }


    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: loggedInUser,
        }),
      });
      return;
    }

    await route.continue();
  });

  // Return a list of all users for admin dashboard
  await page.route(/\/api\/user\/?(\?.*)?$/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({ json: { users: Object.values(validUsers) } });
  });

  // Delete a user (admin only)
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    const method = route.request().method();
    const userId = route.request().url().split('/').pop();
    console.log('Delete request for user ID:', userId);
    if (method === 'DELETE') {
      if (!loggedInUser || !loggedInUser.roles!.some(r => r.role === Role.Admin)) {
        await route.fulfill({ status: 403, json: { error: 'Forbidden' } });
      } else {
        const userToDelete = Object.values(validUsers).find(u => u.id === userId);
        if (userToDelete) {
          delete validUsers[userToDelete.email!];
          if (loggedInUser.email === userToDelete.email) {
            loggedInUser = undefined;
          }
          await route.fulfill({ status: 200, json: { user: userToDelete } });
        } else {
          await route.fulfill({ status: 404, json: { error: 'User not found' } });
        }
      }
    }
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

const userFranchise = {
  id: 999,
  name: 'Store Franchise',
  admins: [{ id: '1' }], 
  stores: [],
};

  await page.route(/\/api\/franchise(\/\d+)?(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      console.log(route.request().url());
      // Check if this is the user franchises endpoint or the all franchises endpoint
      if (route.request().url().includes('/api/franchise/') && !route.request().url().includes('?')) {
       
        await route.fulfill({ json: mockFranchises })
      } else {
        
        await route.fulfill({ json: { franchises: mockFranchises, more: false } })
      }
    }
    if (route.request().method() === 'DELETE') {
      const franchiseId = route.request().url().split('/').pop();
      const index = mockFranchises.findIndex(f => f.id.toString() === franchiseId);
      if (index !== -1) {
        mockFranchises.splice(index, 1); 
        await route.fulfill({ status: 200, json: { message: 'Franchise deleted' } });
      } else {
        await route.fulfill({ status: 404, json: { error: 'Franchise not found' } });
      }
    }
  });

  await page.route('*/**/api/franchise', async (route) => {
    const newFranchise = {
      id: mockFranchises.length + 2, 
      name: 'Added Franchise',
      stores: [{ id: 8, name: 'Main Store' }],
    };
    mockFranchises.push(newFranchise); 
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: newFranchise });
  });

  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    if (route.request().method() === 'POST') {
      const newStore = 'Added Store';
      const franchiseId = route.request().url().split('/')[route.request().url().split('/').length - 2];
      const franchise = mockFranchises.find(f => f.id.toString() === franchiseId);
      if (franchise) {
        franchise.stores.push({ id: franchise.stores.length + 1, name: newStore });
        await route.fulfill({ json: franchise });
      } else {
        await route.fulfill({ status: 404, json: { error: 'Franchise not found' } });
      }
    }
    if (route.request().method() === 'DELETE') {
      const franchiseId = route.request().url().split('/')[route.request().url().split('/').length - 3];
      const storeId = route.request().url().split('/').pop();
      const franchise = mockFranchises.find(f => f.id.toString() === franchiseId);
      if (franchise) {
        const storeIndex = franchise.stores.findIndex(s => s.id.toString() === storeId);
        if (storeIndex !== -1) {
          franchise.stores.splice(storeIndex, 1);
          await route.fulfill({ json: franchise });
        } else {
          await route.fulfill({ status: 404, json: { error: 'Store not found' } });
        }
      } else {
        await route.fulfill({ status: 404, json: { error: 'Franchise not found' } });
      }
    } 
  })

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    // expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('updateUser', async ({ page }) => {
  await basicInit(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  // await expect(page.getByRole('main')).toContainText('pizza diner');

  // await page.getByRole('button', { name: 'Edit' }).click();
  // await expect(page.locator('h3')).toContainText('Edit user');
  // await page.getByRole('button', { name: 'Update' }).click();

  // await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  // Wait for the main content to update with the new name (dialog will close once update completes)
  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

});

test('change password', async ({ page }) => {
  await basicInit(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  const newPassword = `diner${Math.floor(Math.random() * 10000)}`;
  await page.locator('#password').fill(newPassword);

  await page.getByRole('button', { name: 'Update' }).click();

  // await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('401');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(newPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
});
test('list users', async ({ page }) => {
  await basicInit(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: "Admin" }).click();
  // await page.goto('/adminDashboard');
  await page.getByRole('button', { name: 'List Users' }).click();
  // await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await expect(page.locator('text=Page 1 of')).toBeVisible();
  
});

test('change email', async ({ page }) => {
  await basicInit(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill('hello@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  await page.locator('input[type="email"]').fill(email);


  await page.getByRole('button', { name: 'Update' }).click();

  // await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill('hello@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('401');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');
});

test('name filter', async ({ page }) => {
  await basicInit(page);
  const gen_email1 = `user${Math.floor(Math.random() * 1000000)}@jwt.com`;
  const gen_email2 = `user${Math.floor(Math.random() * 1000000)}@jwt.com`;
  const gen_name1 = `pizza diner ${Math.floor(Math.random() * 1000000)}`;
  const gen_name2 = `pizza diner ${Math.floor(Math.random() * 1000000)}`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(gen_name1);
  await page.getByRole('textbox', { name: 'Email address' }).fill(gen_email1);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(
    page.getByRole('link', { name: 'Logout' })
  ).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(gen_name2);
  await page.getByRole('textbox', { name: 'Email address' }).fill(gen_email2);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: "Admin" }).click();
  await page.getByRole('button', { name: 'List Users' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(gen_name1);
  await expect(page.getByRole('cell', { name: gen_name1 }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: gen_name2 })).not.toBeVisible();

});

test('delete user as admin', async ({ page }) => {
  await basicInit(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'Logout' }).click();

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: "Admin" }).click();
  await page.getByRole('button', { name: 'List Users' }).click();

  await page.getByRole('textbox', { name: 'Name' }).fill(email);

  const userRow = page.getByRole('row', { name: new RegExp(email) });

  await userRow.getByRole('button', { name: 'X' }).click();

  await expect(
    page.getByText(email)
  ).not.toBeVisible();


});


