var MCRProtocol = artifacts.require("./MembershipVerificationToken.sol");
const truffleAssert = require("truffle-assertions");

contract("MCRProtocol", function(accounts) {
  let MCRProtocol;
  beforeEach("setup", async () => {
    MCRProtocol = await MCRProtocol.new();

    // 0x626c61636b = hair
    // 0x626c61636b = black
    // 0x7768697465 = white
    await MCRProtocol.addAttributeSet("0x68616972", ["0x626c61636b", "0x7768697465"]);
    await MCRProtocol.addAttributeSet("0x736b696e", ["0x626c61636b", "0x7768697465"]);
    await MCRProtocol.assignTo(accounts[1], [0, 0], {from: accounts[0]});
  });
  it("he is a current member", async () => {
    const data = await MCRProtocol.isCurrentMember(accounts[1]);
    assert.equal(data, true);
  });
  it("he is not a current member", async () => {
    const data = await MCRProtocol.isCurrentMember(accounts[2]);
    assert.equal(data, false);
  });
  it("gets all memebers", async () => {
    const data = await MCRProtocol.getAllMembers();
    assert.equal(data[0], accounts[1]);
  });
  it("gets current memeber count", async () => {
    await MCRProtocol.assignTo(accounts[2], [0, 0], {from: accounts[0]});
    await MCRProtocol.revokeFrom(accounts[1], {from: accounts[0]});
    const data = await MCRProtocol.getCurrentMemberCount();
    assert.equal(data, 1);
  });
  it("list of attributes Names", async () => {
    const data = await MCRProtocol.getAttributeNames();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(data[1]).replace(/\u0000/g, ""), "skin", 32);
  });
  it("list of attributes of a member", async () => {
    const data = await MCRProtocol.getAttributes(accounts[1]);
    // eslint-disable-next-line no-control-regex
    assert.deepEqual(data.map(item => web3.utils.toDecimal(item)), [0, 0]);
  });
  it("gets attribute of a member by name", async () => {
    const data = await MCRProtocol.getAttributeByIndex(accounts[1], 0);
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toDecimal(data), 0);
  });
  it("adds a set of attributes", async () => {
    await MCRProtocol.addAttributeSet(web3.utils.fromAscii("height"), [web3.utils.fromAscii("5"), web3.utils.fromAscii("6")]);
    const data = await MCRProtocol.getAttributeNames();
    // eslint-disable-next-line no-control-regex
    assert.equal(web3.utils.toAscii(data[2]).replace(/\u0000/g, ""), "height", 32);
  });
  it("modifies attribute by index", async () => {
    const result = await MCRProtocol.modifyAttributeByIndex(accounts[1], 0, 0);
    const data = await MCRProtocol.getAttributes(accounts[1]);
    truffleAssert.eventEmitted(result, "ModifiedAttributes");
    // eslint-disable-next-line no-control-regex
    assert.deepEqual(data.map(item => web3.utils.toDecimal(item)), [0, 0]);
  });
  it("request memebership", async () => {
    const requestedMembership = await MCRProtocol.requestMembership([0, 0], {
      from: accounts[2]
    });
    const data = await MCRProtocol.isCurrentMember(accounts[2]);
    const isMembershipPending = await MCRProtocol.pendingRequests(accounts[2]);
    assert.equal(isMembershipPending, true);
    assert.equal(data, false);
    truffleAssert.eventEmitted(requestedMembership, "RequestedMembership");
  });
  it("request and approve memebership", async () => {
    const requestedMembership = await MCRProtocol.requestMembership([0, 0], {
      from: accounts[2]
    });
    const approvedMembership = await MCRProtocol.approveRequest(accounts[2], {
      from: accounts[0]
    });
    const data = await MCRProtocol.isCurrentMember(accounts[2]);
    assert.equal(data, true);
    const attr = await MCRProtocol.getAttributes(accounts[2]);
    // eslint-disable-next-line no-control-regex
    assert.deepEqual(attr.map(item => web3.utils.toDecimal(item)), [0, 0]);
    truffleAssert.eventEmitted(requestedMembership, "RequestedMembership");
    truffleAssert.eventEmitted(approvedMembership, "ApprovedMembership");
  });
  it("discard memebership request", async () => {
    const requestedMembership = await MCRProtocol.requestMembership([0, 0], {
      from: accounts[2]
    });
    await MCRProtocol.discardRequest(accounts[2], {
      from: accounts[0]
    });
    const isMembershipPending = await MCRProtocol.pendingRequests(accounts[2]);
    const data = await MCRProtocol.isCurrentMember(accounts[2]);
    assert.equal(isMembershipPending, false);
    assert.equal(data, false);
    truffleAssert.eventEmitted(requestedMembership, "RequestedMembership");
  });
  it("self revoke memebership", async () => {
    const revoke = await MCRProtocol.forfeitMembership({
      from: accounts[1]
    });
    truffleAssert.eventEmitted(revoke, "Forfeited");
    const data = await MCRProtocol.isCurrentMember(accounts[1]);
    assert.equal(data, false);
  });
  it("owner revokes memebership", async () => {
    const revoke = await MCRProtocol.revokeFrom(accounts[1], {
      from: accounts[0]
    });
    truffleAssert.eventEmitted(revoke, "Revoked");
    const data = await MCRProtocol.isCurrentMember(accounts[1]);
    assert.equal(data, false);
  });
  it("gets attribute collection", async () => {
    const data = await MCRProtocol.getAttributeExhaustiveCollection(0);
    assert.equal("0" + data[1].replace(/0/g, ""), "0x626c61636b");
    assert.equal("0" + data[0].replace(/0/g, ""), "0x756e646566696e6564");
  });
});
