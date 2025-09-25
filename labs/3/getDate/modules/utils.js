function getDateTimeNow() {
  const dateTimeNow = new Date().toString();
  console.log(dateTimeNow);
  return dateTimeNow;
}

module.exports = {
  getDateTimeNow,
};
