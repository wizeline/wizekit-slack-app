function getToDate(toDate) {
  let tempDate = toDate ? new Date(toDate) : new Date();
  tempDate.setDate(tempDate.getDate() + 1);
  return tempDate.toISOString().split('T')[0];
}

module.exports = {
  getToDate,
};
