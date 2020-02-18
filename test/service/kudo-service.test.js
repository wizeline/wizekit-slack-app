const { expect } = require('chai');
const userService = require('../../src/service/user-service');

describe('test kudo-service', () => {
  describe('get user list ', () => {
    it('should has full list', () => {
      const users = userService.extractUserList('<@UJ26X21K3|vanducld> adsf <@UJPSQGLEA|gcp_quiz_bot> <@UQP9B1J4B|sang.dinh> <@UQE9V3VBK|anh.diep> asd f asdf asd fa sdf asd fá df asdf a sdf 144', 'vanduclddev');
      expect(users).to.eql(['<@UJ26X21K3|vanducld>', '<@UJPSQGLEA|gcp_quiz_bot>', '<@UQP9B1J4B|sang.dinh>', '<@UQE9V3VBK|anh.diep>']);
    });

    it('should remove duplicated', () => {
      const users = userService.extractUserList('<@UJ26X21K3|vanduclddev> adsf <@UJ26X21K3|vanduclddev> <@UJ26X21K3|vanducld> <@UQE9V3VBK|anh.diep> asd f asdf asd fa sdf asd fá df asdf a sdf 144', 'vanducld');
      expect(users).to.eql(['<@UJ26X21K3|vanduclddev>', '<@UQE9V3VBK|anh.diep>']);
    });

    it('should remove current user', () => {
      const users = userService.extractUserList('<@UJ26X21K3|vanduclddev> adsf <@UJ26X21K3|vanduclddev> <@UJ26X21K3|vanduclddev> <@UQE9V3VBK|anh.diep> asd f asdf asd fa sdf asd fá df asdf a sdf 144', 'vanduclddev');
      expect(users).to.eql(['<@UQE9V3VBK|anh.diep>']);
    });

    it('should return list of username', () => {
      const users = userService.getUserNameList(['<@UJ26X21K3|vanduclddev>', '<@UQE9V3VBK|anh.diep>']);
      expect(users).to.eql(['vanduclddev', 'anh.diep']);
    });

    it('should return list of username', () => {
      const users = userService.getUserNameList(['<@UJ26X21K3|vanduclddev>', '<@UQE9V3VBK|anh.diep>', '<@UQE9V3VBK>']);
      expect(users).to.eql(['vanduclddev', 'anh.diep']);
    });
  });
});
