let receiptService = (() => {
    function createEmptyReceipt() {
        let data = {
            'active': 'true',
            'productCount': 0,
            'total': 0
        };
        return requester.post('appdata', 'receipts', 'kinvey', data);
    }

    function getActiveReceipt(userId) {
        let endpoint = `receipts?query={"_acl.creator":"${userId}","active":"true"}`;

        return requester.get('appdata', endpoint, 'kinvey');
    }

    function updateReceipt(receiptId, data) {
        let endpoint = `receipts/${receiptId}`;
        return requester.update('appdata', endpoint, 'kinvey', data);
    }

    function getMyReceipts(userId) {
        let endpoint = `receipts?query={"_acl.creator":"${userId}","active":"false"}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }

    return {
        createEmptyReceipt,
        getActiveReceipt,
        updateReceipt,
        getMyReceipts
    }
})();