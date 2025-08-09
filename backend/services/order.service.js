// placeholder to illustrate service layer
exports.calculateTotal = (items, productsMap) => {
  let total = 0;
  for (const it of items) {
    total += it.quantity * productsMap[it.productId].price;
  }
  return total;
};
