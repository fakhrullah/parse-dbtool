jest.mock('parse/node');
const Parse = require('parse/node');

const { Object: ParseObject } = jest.requireActual('parse/node');
const { getAllRunMigrations } = require('../src/libs/migration-model');

test('should return list of migrations', async () => {
  const mockFindAll = jest.fn();
  Parse.Query.prototype.findAll = mockFindAll;
  const migrationOne = new ParseObject('Migration');
  migrationOne.set('name', 'hello.js');
  const migrations = [migrationOne];

  mockFindAll.mockReturnValue(Promise.resolve(migrations));

  const allMigrationsName = await getAllRunMigrations(Parse);

  expect(Array.isArray(allMigrationsName)).toBeTruthy();
  expect(allMigrationsName).toContain('hello.js');
});

test('should throw error cannot found migrations', async () => {
  const mockFindAll = jest.fn();
  Parse.Query.prototype.findAll = mockFindAll;
  mockFindAll.mockRejectedValue(new Error('Cannot found Migration object'));

  await expect(getAllRunMigrations(Parse)).rejects.toThrow();
});

test('should throw error when migrations is empty', async () => {
  const mockFindAll = jest.fn();
  Parse.Query.prototype.findAll = mockFindAll;
  const migrations = [];

  mockFindAll.mockReturnValue(Promise.resolve(migrations));

  await expect(getAllRunMigrations(Parse)).resolves.toHaveLength(0);
});
