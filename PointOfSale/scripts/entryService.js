let entryService = (() => {
    function getEntriesByReceipt(receiptId) {
        let endpoint = `entries?query={"receiptId":"${receiptId}"}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }
    
    function addEntry(type, qty, price, receiptId) {
        let data = {type, qty, price, receiptId};
        return requester.post('appdata', 'entries', 'kinvey', data);
    }

    function deleteEntry(entryId) {
        let endpoint = `entries/${entryId}`;
        return requester.remove('appdata', endpoint, 'kinvey');
    }

    return {
        getEntriesByReceipt,
        addEntry,
        deleteEntry
    }
})();