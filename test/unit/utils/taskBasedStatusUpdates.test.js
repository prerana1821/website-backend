const chai = require("chai");
const { NotFound } = require("http-errors");
const { expect } = chai;
const { userState } = require("../../../constants/userStatus");
const {
  generateAlreadyExistingStatusResponse,
  getUserIdFromUserName,
  checkIfUserHasLiveTasks,
  generateErrorResponse,
} = require("../../../utils/userStatus");

describe("Task Based User Status Update Util Functions", function () {
  it('should return an object with status "success" and message that the state is already in that state', function () {
    const result = generateAlreadyExistingStatusResponse(userState.ACTIVE);
    expect(result).to.deep.equal({
      status: "success",
      message: `The status is already ${userState.ACTIVE}`,
      data: {
        currentStatus: userState.ACTIVE,
      },
    });
  });

  it("should return an object with status 500 and an error message", function () {
    const message = "user not found";
    const result = generateErrorResponse(message);
    expect(result).to.deep.equal({
      status: 500,
      message: "user not found",
      error: "Internal Server Error",
    });
  });

  describe("checkIfUserHasLiveTasks", function () {
    it("should return true if the user has active tasks", async function () {
      const userId = "user123";
      const mockSnapshot = {
        size: 2,
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      const result = await checkIfUserHasLiveTasks(userId, tasksModel);
      expect(result).to.equal(true);
    });

    it("should return false if the user does not have any active tasks", async function () {
      const userId = "user123";
      const mockSnapshot = {
        size: 0,
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      const result = await checkIfUserHasLiveTasks(userId, tasksModel);
      expect(result).to.equal(false);
    });

    it("should throw an error if an error occurs during the query", async function () {
      const userId = "user123";
      const errorMessage = "Query error";
      const mockError = new Error(errorMessage);
      const mockGet = () => Promise.reject(mockError);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      try {
        await checkIfUserHasLiveTasks(userId, tasksModel);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(errorMessage);
      }
    });
  });

  describe("getUserIdFromUserName", function () {
    it("should return the userId from the user Name", async function () {
      const userName = "randhir";
      const userId = "user123";
      const mockSnapshot = {
        size: 1,
        docs: [{ id: userId }],
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const usersModel = {
        where: mockWhere,
      };

      const result = await getUserIdFromUserName(userName, usersModel);
      expect(result).to.equal("userId123");
    });

    it("should throw error if query size is 0", async function () {
      const userName = "randhir";
      const mockSnapshot = {
        size: 0,
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const usersModel = {
        where: mockWhere,
      };

      try {
        await getUserIdFromUserName(userName, usersModel);
      } catch (error) {
        expect(error).to.be.an.instanceof(Error);
        expect(error).to.be.an.instanceof(NotFound);
        expect(error.message).to.equal(`Something went wrong. Username ${userName} could not be found.`);
      }
    });

    it("should throw error if the firestore query fails", async function () {
      const userName = "randhir";
      const mockError = new Error(`Something went wrong. The User ${userName} couldn't be verified.`);
      const mockGet = () => Promise.reject(mockError);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const usersModel = {
        where: mockWhere,
      };

      try {
        await getUserIdFromUserName(userName, usersModel);
      } catch (error) {
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal(`Something went wrong. The User ${userName} couldn't be verified.`);
      }
    });
  });
});
