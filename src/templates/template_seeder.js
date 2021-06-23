/**
 *
 * @param {Parse} Parse
 */
exports.run = async (Parse) => {
  /**
    * Example:
    *
    * Seed pets
    */

  const tom = new Parse.Object('Pet');
  tom.set('name', 'Tom');
  tom.set('photoUrl', 'https://placekitten.com/200/300');

  const angela = new Parse.Object('Pet');
  angela.set('name', 'angela');
  angela.set('photoUrl', 'https://placekitten.com/300/300');

  const pets = [tom, angela];

  return Parse.Object.saveAll(pets, { useMasterKey: true });
};
