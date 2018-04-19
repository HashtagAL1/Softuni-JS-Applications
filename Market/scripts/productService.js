let productService = (() => {
    function getAllProducts() {
        return requester.get('appdata', 'products', 'kinvey');
    }
    function getSingleProduct(productId) {
        let endpoint = `products/${productId}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }

    return {
        getAllProducts,
        getSingleProduct
    }
})();