const mongoose = require('mongoose');
const User = mongoose.model('User');
const Blog = mongoose.model('Blog');

module.exports = {
  createUser: () => {
    return new User().save();
  },
  deleteUser: async (user) => {
    await Blog.deleteMany({ _user: user._id });
    await User.deleteOne(user);
  }
};
