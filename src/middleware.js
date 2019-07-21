const activeSession = (req, res, next) => {
  if (!req.session.logged) {
    console.log("not allowed!");
    return res.redirect('/login');
  }
  next();
};
const unactiveSession = (req, res, next) => {
  if (req.session.logged) {
    console.log("must be logged out");
    res.redirect('back');
  }
  next();
};
module.exports = {activeSession, unactiveSession};