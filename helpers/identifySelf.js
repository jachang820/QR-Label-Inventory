module.exports = (users, my_email) => {
	var i;
	for (i = 0; i < users.length; i++) {
		if (users[i].email == my_email) {
			users[i].self = true;
		}
	}
	return users;
}