(function() {
    // Check if the code has already been executed
    if (window.paymentScriptExecuted) {
        return;
    }
 
    // Set a flag to indicate that the code has been executed
    window.paymentScriptExecuted = true;
 
    $(document).ready(function() {
        // Initially hide the sidebar
        $('#sidebar').hide();
 
        // Total price in the cart
        let totalPrice = 0;
 
        // Array to store products in the cart
        let cartProducts = [];
 
        // Hamburger button functionality
        $('.menu-toggle').click(function() {
            $('#sidebar').toggle(); // Toggle visibility of sidebar
            if ($('#sidebar').is(':visible')) {
 
                fetchCustomerInfo();
                // Fetch and display customer information when sidebar is visible
            }
        });
        function fetchCustomerInfo() {
            var customerId = localStorage.getItem('uid');
            if (customerId) {
                $.ajax({
                    url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Customer/${customerId}`,
                    type: 'GET',
                    success: function(response) {
                        displayCustomerInfo(response.fields);
                    },
                    error: function(error) {
                        console.error('Error fetching customer information:', error);
                    }
                });
            } else {
                console.error('Customer ID not found in local storage');
            }
        }
 
 
        // Function to display customer information
        function displayCustomerInfo(customerData) {
            const fullName = customerData.fullName.stringValue;
            const contact = customerData.contact.stringValue;
            const email = customerData.email.stringValue;
            const credit = customerData.credit.integerValue;
 
            const customerInfoHTML = `
                <h2>Customer Information:</h2>
                <p>Name: ${fullName}</p>
                <p>Contact: ${contact}</p>
                <p>Email: ${email}</p>
                <p>Credit: ${credit}</p>
            `;
            $('#customerInfo').html(customerInfoHTML);
        }
 
        // Fetch and display products from inventory
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Inventory',
            type: 'GET',
            success: function(response) {
                displayProducts(response.documents);
            },
            error: function(error) {
                console.error('Error fetching products:', error);
            }
        });
 
        // Function to display products
        function displayProducts(products) {
            const productGrid = $('.product-grid');
            products.forEach(product => {
                const productData = product.fields;
                const productName = productData.name.stringValue;
                const productCategory = productData.category.stringValue;
                const productPrice = parseFloat(productData.price.doubleValue); // Parse price as float
                const productQuantity = productData.quantity.integerValue;
                // You may need to retrieve product images as well
                const productCardHTML = `
                    <div class="product-card">
                        <h3>${productName}</h3>
                        <p>Category: ${productCategory}</p>
                        <p>Price: $${productPrice}</p>
                        <p>Available Quantity: ${productQuantity}</p>
                        <button class="add-to-cart" data-product="${productName}" data-price="${productPrice}" data-quantity="${productQuantity}">Add to Cart</button>
                    </div>
                `;
                productGrid.append(productCardHTML);
            });
 
            // Add event listener for add to cart button
            $('.add-to-cart').click(function() {
                const productName = $(this).data('product');
                const productPrice = parseFloat($(this).data('price')); // Convert to float
                const productQuantity = parseInt($(this).data('quantity')); // Convert to integer
                addToCart(productName, productPrice, productQuantity);
            });
        }
 
        // Function to add product to cart
        function addToCart(productName, productPrice, productQuantity) {
            const cart = $('#cart');
            const existingCartItem = cart.find(`[data-product="${productName}"]`);
            if (existingCartItem.length > 0) {
                // If the product is already in the cart, ask for confirmation to add one more
                if (confirm(`The product ${productName} is already in the cart. Do you want to add one more?`)) {
                    updateCartItem(existingCartItem, productName, productPrice, productQuantity);
                }
            } else {
                // If the product is not in the cart, proceed as usual
                if (confirm(`Add ${productName} to cart for $${productPrice}?`)) {
                    // Add the product to cart
                    const cartItemHTML = `<div data-product="${productName}" data-quantity="1">${productName} - $${productPrice} <span class="quantity">1</span> <button class="update-cart">Update</button> <button class="delete-cart">Delete</button></div>`;
                    cart.append(cartItemHTML);
                    // Update the total price
                    totalPrice += productPrice;
                    $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                    // Add product to cartProducts array
                    cartProducts.push({
                        name: productName,
                        quantity: 1
                    });
                    // Add event listeners for update and delete buttons
                    cart.find(`[data-product="${productName}"] .update-cart`).click(function() {
                        updateCartItem($(this).closest('[data-product]'), productName, productPrice, productQuantity);
                    });
                    cart.find(`[data-product="${productName}"] .delete-cart`).click(function() {
                        deleteCartItem($(this).closest('[data-product]'), productPrice);
                    });
                }
            }
        }
 
        // Function to update quantity of product in cart
        function updateCartItem(cartItem, productName, productPrice, productQuantity) {
            let quantity = parseInt(cartItem.find('.quantity').text());
            const newQuantity = parseInt(prompt(`Current quantity of ${productName}: ${quantity}\nEnter new quantity (up to ${productQuantity}):`));
            if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= productQuantity) {
                // Update quantity and total price
                totalPrice -= productPrice * quantity;
                totalPrice += productPrice * newQuantity;
                cartItem.find('.quantity').text(newQuantity);
                $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                // Update quantity in cartProducts array
                const index = cartProducts.findIndex(item => item.name === productName);
                cartProducts[index].quantity = newQuantity;
            } else {
                alert('Invalid quantity. Please enter a valid quantity within the available quantity limit.');
            }
        }
 
        // Function to delete product from cart
        function deleteCartItem(cartItem, productPrice) {
            const productName = cartItem.data('product');
            const quantity = parseInt(cartItem.find('.quantity').text());
            if (confirm(`Are you sure you want to remove ${quantity} ${productName}(s) from the cart?`)) {
                // Remove item from cart and update total price
                cartItem.remove();
                totalPrice -= productPrice * quantity;
                $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                // Remove item from cartProducts array
                cartProducts = cartProducts.filter(item => item.name !== productName);
            }
        }
 
        // Payment button functionality
        $('#paymentButton').one('click', function() {
            // Check if the cart is empty
            if (cartProducts.length === 0) {
                alert('Cart is empty. Please add items to proceed with the payment.');
                return; // Exit function if cart is empty
            }
       
            const paymentMethod = $('#paymentMethod').val();
            if (paymentMethod === 'cash') {
                processCashPayment();
            } else if (paymentMethod === 'credit') {
                processCreditPayment();
            }
        });
       
        // Function to process cash payment
        function processCashPayment() {
            const confirmation = confirm(`Confirm payment using cash?`);
            if (confirmation) {
                // Payment confirmed, update inventory and create order
                updateInventory();
                createOrder('cash'); // Pass payment method as argument
                alert('Payment confirmed!');
            } else {
                // Payment not confirmed, you can handle this case as needed
                alert('Payment canceled.');
            }
        }
       
        // Function to process credit payment
       // Function to process credit payment
function processCreditPayment() {
    // Fetch customer's credit
    const customerId = localStorage.getItem('uid');
    if (customerId) {
        $.ajax({
            url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Customer/${customerId}`,
            type: 'GET',
            success: function(response) {
                const credit = response.fields.credit.integerValue;
                if (totalPrice <= credit) {
                    // Sufficient credit, proceed with the purchase
                    updateInventory();
                    const remainingCredit = credit - totalPrice;
                    updateCustomerCredit(customerId, remainingCredit);
                    createOrder('credit'); // Pass payment method as argument
                    alert('Payment confirmed!');
                } else {
                    alert('Insufficient credit.');
                }
            },
            error: function(error) {
                console.error('Error fetching customer information:', error);
            }
        });
    } else {
        console.error('Customer ID not found in local storage');
    }
}
 
       
// Function to update customer's credit
function updateCustomerCredit(customerId, remainingCredit) {
    // Fetch the existing customer data first
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Customer/${customerId}`,
        type: 'GET',
        success: function(response) {
            const customerData = response.fields;
            // Update the credit field and include other existing fields
            customerData.credit = { integerValue: remainingCredit };
            // Perform the PATCH request with the updated customer data
            $.ajax({
                url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Customer/${customerId}`,
                type: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify({ fields: customerData }),
                success: function(response) {
                    console.log('Customer credit updated successfully.');
                },
                error: function(error) {
                    console.error('Error updating customer credit:', error);
                }
            });
        },
        error: function(error) {
            console.error('Error fetching customer information:', error);
        }
    });
}
 
 
        // Function to update inventory
        function updateInventory() {
            // Fetch all inventory items
            $.ajax({
                url: 'https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Inventory',
                type: 'GET',
                success: function(response) {
                    const inventoryItems = response.documents;
                    // Iterate over each inventory item
                    inventoryItems.forEach(inventoryItem => {
                        const inventoryId = inventoryItem.name.split('/').pop(); // Extract document ID
                        const inventoryData = inventoryItem.fields;
                        const productName = inventoryData.name.stringValue;
                        const productQuantity = inventoryData.quantity.integerValue;
                        // Check if this product is in the cart
                        const cartProduct = cartProducts.find(product => product.name === productName);
                        if (cartProduct) {
                            const cartQuantity = cartProduct.quantity;
                            // Update quantity in inventory
                            const newQuantity = productQuantity - cartQuantity;
                            if (newQuantity >= 0) {
                                // Construct fields object including other fields in inventory
                                const fieldsToUpdate = {
                                    quantity: {
                                        integerValue: newQuantity
                                    }
                                    // Include other fields to update here if needed
                                };
                                Object.keys(inventoryData).forEach(key => {
                                    if (key !== 'quantity') {
                                        fieldsToUpdate[key] = inventoryData[key];
                                    }
                                });
                                // Perform AJAX call to update inventory
                                $.ajax({
                                    url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Inventory/${inventoryId}`,
                                    type: 'PATCH',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        fields: fieldsToUpdate
                                    }),
                                    success: function(response) {
                                        console.log(`Inventory updated for ${productName}`);
                                    },
                                    error: function(error) {
                                        console.error(`Error updating inventory for ${productName}:`, error);
                                    }
                                });
                            } else {
                                console.error(`Insufficient quantity in inventory for ${productName}`);
                            }
                        }
                    });
                },
                error: function(error) {
                    console.error('Error fetching inventory:', error);
                }
            });
        }
 
        // Function to create order
        // Function to create order
        function createOrder() {
            const date = new Date().toISOString();
            // Retrieve customer ID from local storage
            var customerId = localStorage.getItem('uid');
            console.log(customerId);
            if (customerId) {
                const paymentMethod = $('#paymentMethod').val(); // Get payment method from the select element
               
                // Fetch category names for products in the cart
                fetchCategoryNames(cartProducts)
                .then(categoryNames => {
                    const purchaseData = {
                        fields: {
                            "I Name": {
                                "stringValue": cartProducts.map(product => product.name).join(", ") // Concatenate all product names
                            },
                            "Customer ID": {
                                "stringValue": customerId
                            },
                            "Price": {
                                "integerValue": totalPrice.toString()
                            },
                            "Date": {
                                "timestampValue": date
                            },
                            "Quantity": {
                                "integerValue": cartProducts.reduce((total, product) => total + product.quantity, 0).toString() // Sum up all quantities
                            },
                            "Unit of Measure": {
                                "stringValue": "count"
                            },
                            "Payment Mode": { // Add Payment Mode field
                                "stringValue": paymentMethod
                            },
                            "Category Name": { // Add Category Name field
                                "stringValue": categoryNames.join(", ")
                            }
                        }
                    };
               
                    // Perform AJAX call to create the order
                    $.ajax({
                        url: 'https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Purchase',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(purchaseData),
                        success: function(response) {
                            console.log('Order created successfully:', response);
                        },
                        error: function(error) {
                            console.error('Error creating order:', error);
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching category names:', error);
                });
            } else {
                console.error('Customer ID not found in local storage');
            }
        }
       
        // Function to fetch category name for each product
        function fetchCategoryNames(products) {
            const promises = products.map(product => {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: `https://firestore.googleapis.com/v1/projects/online-store-5bfad/databases/(default)/documents/Inventory`,
                        type: 'GET',
                        success: function(response) {
                            const category = response.documents.find(item => item.fields.name.stringValue === product.name).fields.category.stringValue;
                            resolve(category);
                        },
                        error: function(error) {
                            reject(error);
                        }
                    });
                });
            });
       
            // Return a promise that resolves when all category names are fetched
            return Promise.all(promises);
        }
       
 
    });
})();