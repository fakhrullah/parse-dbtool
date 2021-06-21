const { isStartWithKeywordCreate, isRequiredEnvironmentAvailable } = require('../libs/helpers');

test('should start with "create"', () => {
  expect(isStartWithKeywordCreate('create-something')).toBe(true);
});

test('should not start with "create" keyword', () => {
  expect(isStartWithKeywordCreate('add_new-field')).toBe(false);
});

test('should return true when APPLICATION_ID, MASTER_KEY, SERVER_URL passed', async () => {
  expect(await isRequiredEnvironmentAvailable(
    'serverUrl',
    'appId',
    'masterKey',
  )).toBe(true);
});
