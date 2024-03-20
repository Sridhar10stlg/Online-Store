$(document).ready(function() {
    // Show All Sales button click event
    $('#showAllSalesBtn').on('click', function() {
        fetchAndDisplaySales('All', 'sales.csv');
    });
 
    // Credit Sales button click event
    $('#showCreditSalesBtn').on('click', function() {
        fetchAndDisplaySales('credit', 'creditsales.csv');
    });
 
    // Cash Sales button click event
    $('#showCashSalesBtn').on('click', function() {
        fetchAndDisplaySales('cash', 'cashsales.csv');
    });
 
    // Filter By Date button click event
    $('#getOrdersByDateRange').on('click', function() {
        var fromDate = $('#fromDate').val();
        var toDate = $('#toDate').val();
        if (fromDate && toDate) {
            getOrdersByDateRange();
        } else {
            alert('Please select both From and To dates.');
        }
    });
 
    // Function to fetch and display sales based on payment method
    function fetchAndDisplaySales(paymentMethod, fileName) {
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Purchase',
            type: 'GET',
            success: function(response) {
                var sales = response.documents;
                var filteredSales = [];
 
                if (paymentMethod === 'All') {
                    filteredSales = sales;
                } else {
                    filteredSales = sales.filter(function(sale) {
                        return getFieldTextValue(sale.fields['Payment Mode']) === paymentMethod;
                    });
                }
 
                downloadSalesAsCSV(filteredSales, fileName);
            },
            error: function(error) {
                console.error('Error fetching sales:', error);
            }
        });
    }
 
    // Function to convert sales data to CSV format and trigger download
    function downloadSalesAsCSV(sales, fileName) {
        var csv = 'Sale ID,Customer ID,Date,Item Name,Price,Quantity,Payment Method\n';
        sales.forEach(function(sale) {
            var saleId = sale.name.split('/').pop();
            var customerId = getFieldTextValue(sale.fields['Customer ID']);
            var date = getFieldTextValue(sale.fields['Date']);
            var itemName = getFieldTextValue(sale.fields['I Name']);
            var price = getFieldTextValue(sale.fields['Price']);
            var quantity = getFieldTextValue(sale.fields['Quantity']);
            var paymentMethod = getFieldTextValue(sale.fields['Payment Mode']);
            csv += saleId + ',' + customerId + ',' + date + ',' + itemName + ',' + price + ',' + quantity + ',' + paymentMethod + '\n';
        });
 
        // Create a hidden link element to trigger the download
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName; // Set the filename
        hiddenElement.click();
    }
 
    // Function to get text value of a field
    function getFieldTextValue(fieldValue) {
        if (fieldValue && fieldValue.stringValue !== undefined) {
            return fieldValue.stringValue;
        } else if (fieldValue && fieldValue.integerValue !== undefined) {
            return fieldValue.integerValue;
        } else if (fieldValue && fieldValue.doubleValue !== undefined) {
            return fieldValue.doubleValue;
        } else if (fieldValue && fieldValue.timestampValue !== undefined) {
            return new Date(fieldValue.timestampValue).toLocaleDateString();
        } else {
            return 'Unknown';
        }
    }
});
 
document.addEventListener('DOMContentLoaded', function() {
 
    const getOrdersByDateRangeBtn = document.getElementById('getOrdersByDateRange');
    getOrdersByDateRangeBtn.addEventListener('click', getOrdersByDateRange);
});
 
 function getOrdersByDateRange() {
    const startDate = moment(document.getElementById('fromDate').value);
    const endDate = moment(document.getElementById('toDate').value);
 
    fetch('https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Purchase', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const ordersWithinRange = data.documents.filter(order => {
            const orderTimestamp = order.createTime;
            const orderDate = moment(orderTimestamp, 'YYYY-MM-DD'); // Adjust the format as per your timestamp format
            return orderDate.isBetween(startDate, endDate, null, '[]');
        });
 
        generateReport(ordersWithinRange);
    })
    .catch(error => {
        console.error('Error fetching orders by date range:', error);
    });
}
 
function generateReport(orders) {
    let csvContent = "Customer ID,Item Name,Quantity,Price,Date\n"; // CSV header
 
    orders.forEach(order => {
        const customerId = order.fields["Customer ID"].stringValue;
        const itemName = order.fields["I Name"].stringValue;
        const quantity = order.fields.Quantity.integerValue;
        const price = order.fields.Price.integerValue;
 
        // Convert timestamp to JavaScript Date object
        const date = new Date(order.createTime);
        const formattedDate = date.toLocaleString(); // Format the date as per your requirement
 
        csvContent += `${customerId},${itemName},${quantity},${price},${formattedDate}\n`;
    });
 
    downloadCSV(csvContent, 'filteredbyDate.csv');
}
 
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
 
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
 
    document.body.appendChild(link);
    link.click();
 
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
}