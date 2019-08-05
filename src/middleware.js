const ensureAuth = (req, res, next) => {
  if (!req.session.logged) {
    console.log("not allowed!")
    return res.redirect(`/login?redirect=${req.originalUrl}`);
  }
  req.session.touch();
  next();
};
const ensureNoAuth = (req, res, next) => {
  if (req.session.logged) {
    console.log("must be logged out");
    res.redirect('back');
  }
  next();
};
module.exports = {ensureAuth, ensureNoAuth};