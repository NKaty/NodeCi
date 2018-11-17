const Page = require('./helpers/page');
const { deleteUser } = require('./factories/userFactory');

let page, user;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  if (user) await deleteUser(user);
  await page.close();
});

describe('when logged in', async () => {
  beforeEach(async () => {
    user = await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('and using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My content');
      await page.click('form button');
    });

    test('submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('form h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('.card p');
      expect(title).toEqual('My title');
      expect(content).toEqual('My content');
    });
  });

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('user is not logged in', async () => {
  test('user cannot create blog posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-original',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'My new title',
          content: 'My new content'
        })
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('user cannot get a list of posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-original',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});
