// This is the core roles that will be installed automatically by bootstrap.js
// Additional roles can be added via UI (eventually)

module.exports.roles = {
    coreRoles: [
        { roleName: "admin", subRole: "" },
        { roleName: "user",  subRole: "" },
        { roleName: "proprietor", subRole: "owner"},
        {roleName: "proprietor", subRole: "manager"},
        {roleName: "sponsor", subRole: ""}
        ]
};