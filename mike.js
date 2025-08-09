 <script>
        let orderItems = [];
        let orderNumber = 1001;
        let customerData = {};
        let selectedPayment = '';
        let orderHistory = [];
        
        // Menu items with prices
        const menuItems = {
            'pizza': { name: 'Large Pizza', price: 7500, emoji: '🍕' },
            'pepperoni pizza': { name: 'Pepperoni Pizza', price: 8500, emoji: '🍕' },
            'margherita pizza': { name: 'Margherita Pizza', price: 8000, emoji: '🍕' },
            'burger': { name: 'Classic Burger', price: 5200, emoji: '🍔' },
            'cheeseburger': { name: 'Cheeseburger', price: 5600, emoji: '🍔' },
            'fries': { name: 'French Fries', price: 2000, emoji: '🍟' },
            'salad': { name: 'Garden Salad', price: 3600, emoji: '🥗' },
            'caesar salad': { name: 'Caesar Salad', price: 4400, emoji: '🥗' },
            'coke': { name: 'Coca Cola', price: 1200, emoji: '🥤' },
            'coca cola': { name: 'Coca Cola', price: 1200, emoji: '🥤' },
            'water': { name: 'Bottled Water', price: 800, emoji: '💧' },
            'coffee': { name: 'Coffee', price: 1600, emoji: '☕' },
            'sandwich': { name: 'Club Sandwich', price: 4000, emoji: '🥪' },
            'pasta': { name: 'Spaghetti Pasta', price: 6000, emoji: '🍝' },
            'chicken': { name: 'Grilled Chicken', price: 6800, emoji: '🍗' }
        };
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        function quickOrder(item) {
            document.getElementById('messageInput').value = item;
            sendMessage();
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            // Check for admin access first
            if (checkAdminAccess(message)) {
                return; // Don't process as regular order
            }
            
            // Show typing indicator
            showTyping();
            
            // Process order after delay
            setTimeout(() => {
                processOrder(message);
            }, 1500);
        }
        
        function addMessage(message, sender) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'flex items-start message-enter';
            
            if (sender === 'user') {
                messageDiv.innerHTML = `
                    <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm ml-auto mr-3 mt-1">
                        U
                    </div>
                    <div class="bg-gray-100 rounded-lg p-3 max-w-xs ml-auto">
                        <p class="text-sm">${message}</p>
                    </div>
                `;
                messageDiv.classList.add('flex-row-reverse');
            } else {
                messageDiv.innerHTML = `
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3 mt-1">
                        AI
                    </div>
                    <div class="bg-blue-50 rounded-lg p-3 max-w-xs">
                        <p class="text-sm">${message}</p>
                    </div>
                `;
            }
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function showTyping() {
            const chatMessages = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing';
            typingDiv.className = 'flex items-start';
            typingDiv.innerHTML = `
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3 mt-1">
                    AI
                </div>
                <div class="bg-blue-50 rounded-lg p-3">
                    <div class="flex space-x-1">
                        <div class="typing-animation"></div>
                        <div class="typing-animation"></div>
                        <div class="typing-animation"></div>
                    </div>
                </div>
            `;
            
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function removeTyping() {
            const typing = document.getElementById('typing');
            if (typing) {
                typing.remove();
            }
        }
        
        function processOrder(message) {
            removeTyping();
            
            const lowerMessage = message.toLowerCase();
            let foundItems = [];
            let response = '';
            
            // Extract quantity if mentioned
            const quantityMatch = lowerMessage.match(/(\d+)\s*x?\s*(.+)|(\d+)\s+(.+)/);
            let quantity = 1;
            let searchText = lowerMessage;
            
            if (quantityMatch) {
                quantity = parseInt(quantityMatch[1] || quantityMatch[3]);
                searchText = (quantityMatch[2] || quantityMatch[4]).trim();
            }
            
            // Find matching menu items
            for (const [key, item] of Object.entries(menuItems)) {
                if (searchText.includes(key)) {
                    foundItems.push({ ...item, quantity });
                    break;
                }
            }
            
            if (foundItems.length > 0) {
                foundItems.forEach(item => {
                    orderItems.push(item);
                    const itemTotal = (item.price * item.quantity).toLocaleString();
                    response += `Great! I've added ${item.quantity}x ${item.name} (${item.emoji}) for ₦${itemTotal} to your order. `;
                });
                response += 'Anything else you\'d like to add?';
                updateReceipt();
            } else {
                response = `I'm sorry, I couldn't find "${message}" on our menu. We have pizza, burgers, salads, drinks, and more. Could you try something else or be more specific?`;
            }
            
            addMessage(response, 'bot');
        }
        
        function updateReceipt() {
            const receiptItems = document.getElementById('receiptItems');
            const receiptTotal = document.getElementById('receiptTotal');
            
            if (orderItems.length === 0) {
                receiptItems.innerHTML = '<p class="text-center text-gray-500 italic">No items ordered yet</p>';
                receiptTotal.classList.add('hidden');
                return;
            }
            
            // Group items by name
            const groupedItems = {};
            orderItems.forEach(item => {
                const key = item.name;
                if (groupedItems[key]) {
                    groupedItems[key].quantity += item.quantity;
                } else {
                    groupedItems[key] = { ...item };
                }
            });
            
            let itemsHTML = '';
            let subtotal = 0;
            
            Object.values(groupedItems).forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                itemsHTML += `
                    <div class="flex justify-between items-center group">
                        <span class="text-sm">${item.emoji} ${item.name} x${item.quantity}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium">₦${itemTotal.toLocaleString()}</span>
                            <button onclick="removeFromOrder('${item.name}')" class="text-red-500 hover:text-red-700 text-xs px-1 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Remove item">
                                ❌
                            </button>
                        </div>
                    </div>
                `;
            });
            
            const total = subtotal;
            
            receiptItems.innerHTML = itemsHTML;
            document.getElementById('subtotal').textContent = `₦${subtotal.toLocaleString()}`;
            document.getElementById('tax').textContent = `₦0`;
            document.getElementById('total').textContent = `₦${total.toLocaleString()}`;
            document.getElementById('orderNumber').textContent = orderNumber;
            document.getElementById('orderTime').textContent = new Date().toLocaleString();
            
            receiptTotal.classList.remove('hidden');
            
            // Show checkout button when items are added
            document.getElementById('checkoutBtn').classList.remove('hidden');
        }
        
        function clearReceipt() {
            orderItems = [];
            orderNumber++;
            customerData = {};
            selectedPayment = '';
            
            // Clear any running timers
            if (window.customerTimer) {
                clearInterval(window.customerTimer);
            }
            if (adminTimer) {
                clearInterval(adminTimer);
            }
            
            // Hide admin panel
            document.getElementById('adminPanel').classList.add('hidden');
            document.getElementById('confirmPaymentBtn').disabled = true;
            updateToggleButton();
            
            // Clear chat messages and reset to initial state
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = `
                <div class="flex items-start message-enter">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3 mt-1">
                        AI
                    </div>
                    <div class="bg-blue-50 rounded-lg p-3 max-w-xs">
                        <p class="text-sm">Hi! I'm your AI order assistant. What would you like to order today? You can ask for items like pizza, burgers, drinks, or anything else!</p>
                    </div>
                </div>
            `;
            
            updateReceipt();
            document.getElementById('checkoutBtn').classList.add('hidden');
        }
        
        function printReceipt() {
            if (orderItems.length === 0) {
                alert('No items to print! Please add some items to your order first.');
                return;
            }
            
            const receiptContent = document.getElementById('receipt').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt #${orderNumber}</title>
                        <style>
                            body { font-family: monospace; padding: 20px; }
                            .receipt-print { background: white; border: 2px dashed #000; padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-print">${receiptContent}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
        
        // Checkout Functions
        function startCheckout() {
            if (orderItems.length === 0) {
                alert('Please add items to your order first!');
                return;
            }
            document.getElementById('customerModal').classList.remove('hidden');
        }
        
        function closeCustomerModal() {
            document.getElementById('customerModal').classList.add('hidden');
        }
        
        function backToCustomerDetails() {
            document.getElementById('paymentModal').classList.add('hidden');
            document.getElementById('customerModal').classList.remove('hidden');
        }
        
        function selectPayment(method) {
            selectedPayment = method;
            document.querySelector(`input[value="${method}"]`).checked = true;
            
            // Calculate total for bank transfer
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            // Show/hide bank details and buttons based on payment method
            const bankDetails = document.getElementById('bankDetails');
            const confirmPayment = document.getElementById('confirmPayment');
            const havePaidBtn = document.getElementById('havePaidBtn');
            
            if (method === 'bank') {
                // Show bank details and "I Have Paid" button for bank transfer
                bankDetails.classList.remove('hidden');
                document.getElementById('transferAmount').textContent = `₦${total.toLocaleString()}`;
                confirmPayment.classList.add('hidden');
                havePaidBtn.classList.remove('hidden');
            } else {
                // Hide bank details and show normal confirm button for other methods
                bankDetails.classList.add('hidden');
                confirmPayment.classList.remove('hidden');
                havePaidBtn.classList.add('hidden');
                confirmPayment.disabled = false;
            }
        }
        
        let adminTimer;
        let adminSeconds = 0;
        
        function customerPaid() {
            // Calculate totals
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            // Close payment modal
            document.getElementById('paymentModal').classList.add('hidden');
            
            // Show processing modal
            document.getElementById('processingModal').classList.remove('hidden');
            
            // Start customer timer
            let seconds = 0;
            const timer = setInterval(() => {
                seconds++;
                document.getElementById('timerCount').textContent = seconds;
            }, 1000);
            
            // Show admin panel and populate with order details
            showAdminPanel(total);
            
            // Store timer reference for admin control
            window.customerTimer = timer;
            
            // Add message to chat
            addMessage(`🏦 Bank transfer initiated! Please wait while we verify your payment. You should receive SMS confirmation shortly.`, 'bot');
        }
        
        function confirmOrder() {
            if (!selectedPayment) {
                alert('Please select a payment method!');
                return;
            }
            
            // Calculate totals
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            // Close payment modal
            document.getElementById('paymentModal').classList.add('hidden');
            
            // Handle Cash on Delivery - skip all payment processing
            if (selectedPayment === 'cash') {
                // Go directly to final confirmation for cash orders
                showCashDeliveryConfirmation(total);
                return;
            }
            
            // This should not be reached since only cash and bank transfer are available
            // Bank transfer is handled by customerPaid function
            document.getElementById('processingModal').classList.remove('hidden');
            
            // Start customer timer
            let seconds = 0;
            const timer = setInterval(() => {
                seconds++;
                document.getElementById('timerCount').textContent = seconds;
            }, 1000);
            
            // Show admin panel and populate with order details
            showAdminPanel(total);
            
            // Store timer reference for admin control
            window.customerTimer = timer;
        }
        
        function showAdminPanel(total) {
            const paymentMethods = {
                'cash': '💵 Cash on Delivery',
                'bank': '🏦 Bank Transfer'
            };
            
            // Populate admin customer info
            document.getElementById('adminCustomerInfo').innerHTML = `
                <p><strong>Name:</strong> ${customerData.name}</p>
                <p><strong>Phone:</strong> ${customerData.phone}</p>
                <p><strong>Email:</strong> ${customerData.email || 'Not provided'}</p>
                <p><strong>Address:</strong> ${customerData.address}</p>
            `;
            
            // Populate admin order info
            const groupedItems = {};
            orderItems.forEach(item => {
                const key = item.name;
                if (groupedItems[key]) {
                    groupedItems[key].quantity += item.quantity;
                } else {
                    groupedItems[key] = { ...item };
                }
            });
            
            let orderHTML = `<p><strong>Order #${orderNumber}</strong></p>`;
            Object.values(groupedItems).forEach(item => {
                orderHTML += `<p>${item.emoji} ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}</p>`;
            });
            orderHTML += `<p class="mt-2"><strong>Total: ₦${total.toLocaleString()}</strong></p>`;
            orderHTML += `<p><strong>Payment:</strong> ${paymentMethods[selectedPayment]}</p>`;
            
            document.getElementById('adminOrderInfo').innerHTML = orderHTML;
            
            // Show admin panel and enable confirm button
            document.getElementById('adminPanel').classList.remove('hidden');
            document.getElementById('confirmPaymentBtn').disabled = false;
            updateToggleButton();
            
            // Start admin timer
            adminSeconds = 0;
            adminTimer = setInterval(() => {
                adminSeconds++;
                document.getElementById('adminTimerCount').textContent = adminSeconds;
            }, 1000);
        }
        
        function adminConfirmPayment() {
            // Stop all timers
            if (window.customerTimer) {
                clearInterval(window.customerTimer);
            }
            if (adminTimer) {
                clearInterval(adminTimer);
            }
            
            // Calculate total for SMS
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            // Hide processing modal and show SMS
            document.getElementById('processingModal').classList.add('hidden');
            document.getElementById('smsOrderNumber').textContent = orderNumber;
            document.getElementById('smsAmount').textContent = total.toLocaleString();
            document.getElementById('smsModal').classList.remove('hidden');
            
            // Hide admin panel
            document.getElementById('adminPanel').classList.add('hidden');
            document.getElementById('confirmPaymentBtn').disabled = true;
            updateToggleButton();
            
            addMessage(`💳 Payment confirmed by admin! Check your SMS for confirmation.`, 'bot');
        }
        
        function showFinalConfirmation() {
            // Save order to history before showing confirmation
            saveOrderToHistory();
            
            // Calculate totals for final confirmation
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            const paymentMethods = {
                'cash': '💵 Cash on Delivery',
                'bank': '🏦 Bank Transfer'
            };
            
            document.getElementById('confirmationDetails').innerHTML = `
                <p><strong>Order #${orderNumber}</strong></p>
                <p>Customer: ${customerData.name}</p>
                <p>Phone: ${customerData.phone}</p>
                <p>Total: ₦${total.toLocaleString()}</p>
                <p>Payment: ${paymentMethods[selectedPayment]}</p>
                <p class="mt-4 text-sm">Delivery address:<br>${customerData.address}</p>
            `;
            
            document.getElementById('smsModal').classList.add('hidden');
            document.getElementById('confirmationModal').classList.remove('hidden');
            
            addMessage(`🎉 Order confirmed! Your order #${orderNumber} is now being prepared. Estimated delivery: 25-35 minutes.`, 'bot');
        }
        
        function closeConfirmation() {
            document.getElementById('confirmationModal').classList.add('hidden');
            clearReceipt();
        }
        
        // Secret Admin Access - Type "admin123" in the chat to access
        let adminKeySequence = '';
        let adminKeyTimeout;
        
        function checkAdminAccess(message) {
            if (message.toLowerCase() === 'admin123') {
                toggleAdminAccess();
                return true; // Don't process as regular order
            }
            return false;
        }
        
        function toggleAdminAccess() {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel.classList.contains('hidden')) {
                // Show demo admin panel
                document.getElementById('adminCustomerInfo').innerHTML = `
                    <p class="text-gray-500 italic">No pending payments</p>
                    <p class="text-sm text-gray-400 mt-2">Admin panel will automatically appear when customers submit payments</p>
                `;
                document.getElementById('adminOrderInfo').innerHTML = `
                    <p class="text-gray-500 italic">No pending orders</p>
                    <p class="text-sm text-gray-400 mt-2">Order details will show here when payments are processing</p>
                `;
                adminPanel.classList.remove('hidden');
                document.getElementById('confirmPaymentBtn').disabled = true;
                document.getElementById('adminTimer').innerHTML = 'Admin panel is now visible';
                
                // Update toggle button
                updateToggleButton();
                
                // Add admin confirmation message
                addMessage(`🔐 Admin access granted! You can now manage payments and menu items.`, 'bot');
            } else {
                // Hide admin panel
                adminPanel.classList.add('hidden');
                updateToggleButton();
                addMessage(`🔐 Admin panel hidden.`, 'bot');
            }
        }
        
        function toggleAdminPanel() {
            const adminPanel = document.getElementById('adminPanel');
            
            if (adminPanel.classList.contains('hidden')) {
                // Show admin panel
                document.getElementById('adminCustomerInfo').innerHTML = `
                    <p class="text-gray-500 italic">No pending payments</p>
                    <p class="text-sm text-gray-400 mt-2">Admin panel will automatically appear when customers submit payments</p>
                `;
                document.getElementById('adminOrderInfo').innerHTML = `
                    <p class="text-gray-500 italic">No pending orders</p>
                    <p class="text-sm text-gray-400 mt-2">Order details will show here when payments are processing</p>
                `;
                adminPanel.classList.remove('hidden');
                document.getElementById('confirmPaymentBtn').disabled = true;
                document.getElementById('adminTimer').innerHTML = 'Admin panel is now visible';
            } else {
                // Hide admin panel
                adminPanel.classList.add('hidden');
            }
            
            updateToggleButton();
        }
        
        function updateToggleButton() {
            const adminPanel = document.getElementById('adminPanel');
            const toggleBtn = document.getElementById('adminToggleBtn');
            
            if (adminPanel.classList.contains('hidden')) {
                toggleBtn.innerHTML = '🔐 Show Admin Panel';
                toggleBtn.className = 'bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg';
            } else {
                toggleBtn.innerHTML = '🔐 Hide Admin Panel';
                toggleBtn.className = 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg';
            }
        }
        
        // Cash on Delivery Confirmation Function
        function showCashDeliveryConfirmation(total) {
            // Save order to history before showing confirmation
            saveOrderToHistory();
            
            // Use the total passed from confirmOrder function
            const paymentMethods = {
                'cash': '💵 Cash on Delivery',
                'bank': '🏦 Bank Transfer'
            };
            
            document.getElementById('confirmationDetails').innerHTML = `
                <p><strong>Order #${orderNumber}</strong></p>
                <p>Customer: ${customerData.name}</p>
                <p>Phone: ${customerData.phone}</p>
                <p>Total: ₦${total.toLocaleString()}</p>
                <p>Payment: ${paymentMethods[selectedPayment]}</p>
                <p class="mt-4 text-sm">Delivery address:<br>${customerData.address}</p>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p class="text-sm text-yellow-800">
                        <strong>⚠️ Important Cash Delivery Instructions:</strong><br>
                        • Pay promptly when driver arrives<br>
                        • Have exact change ready if possible
                    </p>
                </div>
            `;
            
            document.getElementById('confirmationModal').classList.remove('hidden');
            
            addMessage(`💵 Cash on Delivery order confirmed! Order #${orderNumber} is being prepared. Remember to pay on prompt when our driver arrives!`, 'bot');
        }
        
        // Admin Tab Management
        function switchAdminTab(tab) {
            const paymentTab = document.getElementById('paymentTab');
            const menuTab = document.getElementById('menuTab');
            const ordersTab = document.getElementById('ordersTab');
            const paymentSection = document.getElementById('paymentSection');
            const menuSection = document.getElementById('menuSection');
            const ordersSection = document.getElementById('ordersSection');
            
            // Reset all tabs
            paymentTab.className = 'flex-1 py-2 px-4 rounded-md text-gray-600 hover:bg-gray-100 font-medium transition-colors';
            menuTab.className = 'flex-1 py-2 px-4 rounded-md text-gray-600 hover:bg-gray-100 font-medium transition-colors';
            ordersTab.className = 'flex-1 py-2 px-4 rounded-md text-gray-600 hover:bg-gray-100 font-medium transition-colors';
            
            // Hide all sections
            paymentSection.classList.add('hidden');
            menuSection.classList.add('hidden');
            ordersSection.classList.add('hidden');
            
            if (tab === 'payment') {
                paymentTab.className = 'flex-1 py-2 px-4 rounded-md bg-red-100 text-red-700 font-medium transition-colors';
                paymentSection.classList.remove('hidden');
            } else if (tab === 'menu') {
                menuTab.className = 'flex-1 py-2 px-4 rounded-md bg-red-100 text-red-700 font-medium transition-colors';
                menuSection.classList.remove('hidden');
                refreshMenuDisplay();
            } else if (tab === 'orders') {
                ordersTab.className = 'flex-1 py-2 px-4 rounded-md bg-red-100 text-red-700 font-medium transition-colors';
                ordersSection.classList.remove('hidden');
                refreshOrderHistory();
            }
        }
        
        // Menu Management Functions
        function addMenuItem() {
            const name = document.getElementById('itemName').value.trim();
            const price = parseInt(document.getElementById('itemPrice').value);
            const emoji = document.getElementById('itemEmoji').value.trim();
            const keywords = document.getElementById('itemKeywords').value.trim();
            
            if (!name || !price || !emoji || !keywords) {
                alert('Please fill in all fields!');
                return;
            }
            
            // Create search keys from keywords
            const keywordArray = keywords.toLowerCase().split(',').map(k => k.trim());
            
            // Add each keyword as a separate menu item entry
            keywordArray.forEach(keyword => {
                if (keyword && !menuItems[keyword]) {
                    menuItems[keyword] = {
                        name: name,
                        price: price,
                        emoji: emoji
                    };
                }
            });
            
            // Clear form
            document.getElementById('addItemForm').reset();
            
            // Refresh display
            refreshMenuDisplay();
            
            // Show success message
            alert(`✅ "${name}" has been added to the menu! Customers can now order it using: ${keywordArray.join(', ')}`);
        }
        
        function removeMenuItem(keyword) {
            const itemName = menuItems[keyword].name;
            if (confirm(`Are you sure you want to remove "${itemName}" from the menu?`)) {
                // Find all keywords for this item and remove them
                const itemsToDelete = [];
                Object.entries(menuItems).forEach(([key, item]) => {
                    if (item.name === itemName) {
                        itemsToDelete.push(key);
                    }
                });
                
                // Delete all keyword entries for this item
                itemsToDelete.forEach(key => {
                    delete menuItems[key];
                });
                
                refreshMenuDisplay();
                alert(`✅ "${itemName}" has been completely removed from the menu!`);
            }
        }
        
        function refreshMenuDisplay() {
            const container = document.getElementById('currentMenuItems');
            
            if (Object.keys(menuItems).length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic text-sm">No menu items available</p>';
                return;
            }
            
            // Group items by name to avoid duplicates
            const uniqueItems = {};
            Object.entries(menuItems).forEach(([keyword, item]) => {
                if (!uniqueItems[item.name]) {
                    uniqueItems[item.name] = {
                        ...item,
                        keywords: [keyword]
                    };
                } else {
                    uniqueItems[item.name].keywords.push(keyword);
                }
            });
            
            let html = '';
            Object.entries(uniqueItems).forEach(([itemName, item]) => {
                html += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center">
                                <span class="text-lg mr-2">${item.emoji}</span>
                                <div>
                                    <div class="font-medium text-sm">${item.name}</div>
                                    <div class="text-xs text-gray-500">₦${item.price.toLocaleString()}</div>
                                    <div class="text-xs text-blue-600">Keywords: ${item.keywords.join(', ')}</div>
                                </div>
                            </div>
                        </div>
                        <button onclick="removeMenuItem('${item.keywords[0]}')" class="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded transition-colors">
                            🗑️
                        </button>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        // Handle customer form submission
        document.getElementById('customerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect customer data
            customerData = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value
            };
            
            // Close customer modal and show payment modal
            document.getElementById('customerModal').classList.add('hidden');
            document.getElementById('paymentModal').classList.remove('hidden');
        });
        
        // Remove item from current order
        function removeFromOrder(itemName) {
            if (confirm(`Remove ${itemName} from your order?`)) {
                // Remove all instances of this item from the order
                orderItems = orderItems.filter(item => item.name !== itemName);
                updateReceipt();
                
                // Add message to chat
                addMessage(`🗑️ Removed ${itemName} from your order.`, 'bot');
                
                // Hide checkout button if no items left
                if (orderItems.length === 0) {
                    document.getElementById('checkoutBtn').classList.add('hidden');
                }
            }
        }
        
        // Handle add menu item form submission
        document.getElementById('addItemForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addMenuItem();
        });
        
        // Order History Management Functions
        function saveOrderToHistory() {
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal;
            
            // Group items by name for display
            const groupedItems = {};
            orderItems.forEach(item => {
                const key = item.name;
                if (groupedItems[key]) {
                    groupedItems[key].quantity += item.quantity;
                } else {
                    groupedItems[key] = { ...item };
                }
            });
            
            const orderRecord = {
                orderNumber: orderNumber,
                customerName: customerData.name,
                customerPhone: customerData.phone,
                customerEmail: customerData.email || 'Not provided',
                customerAddress: customerData.address,
                items: Object.values(groupedItems),
                total: total,
                paymentMethod: selectedPayment,
                orderDate: new Date().toISOString(),
                status: 'Confirmed'
            };
            
            orderHistory.push(orderRecord);
            updateOrderStatistics();
        }
        
        function refreshOrderHistory() {
            const orderList = document.getElementById('orderHistoryList');
            
            if (orderHistory.length === 0) {
                orderList.innerHTML = '<p class="text-center text-gray-500 italic py-8">No orders yet. Orders will appear here once customers complete their purchases.</p>';
                return;
            }
            
            // Sort orders by date (newest first)
            const sortedOrders = [...orderHistory].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            let html = '';
            sortedOrders.forEach(order => {
                const orderDate = new Date(order.orderDate);
                const formattedDate = orderDate.toLocaleDateString();
                const formattedTime = orderDate.toLocaleTimeString();
                
                const paymentMethods = {
                    'cash': '💵 Cash on Delivery',
                    'bank': '🏦 Bank Transfer'
                };
                
                let itemsHtml = '';
                order.items.forEach(item => {
                    itemsHtml += `<span class="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">${item.emoji} ${item.name} x${item.quantity}</span>`;
                });
                
                html += `
                    <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <div class="font-semibold text-gray-800">Order #${order.orderNumber}</div>
                                <div class="text-sm text-gray-600">${formattedDate} at ${formattedTime}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-green-600">₦${order.total.toLocaleString()}</div>
                                <div class="text-xs text-gray-500">${paymentMethods[order.paymentMethod]}</div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-sm font-medium text-gray-700 mb-1">Customer:</div>
                            <div class="text-sm text-gray-600">${order.customerName} • ${order.customerPhone}</div>
                            <div class="text-xs text-gray-500">${order.customerAddress}</div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-sm font-medium text-gray-700 mb-2">Items Ordered:</div>
                            <div class="flex flex-wrap">
                                ${itemsHtml}
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ ${order.status}
                            </span>
                            <button onclick="viewOrderDetails(${order.orderNumber})" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                                View Details →
                            </button>
                        </div>
                    </div>
                `;
            });
            
            orderList.innerHTML = html;
        }
        
        function updateOrderStatistics() {
            const totalOrdersEl = document.getElementById('totalOrders');
            const totalRevenueEl = document.getElementById('totalRevenue');
            const todayOrdersEl = document.getElementById('todayOrders');
            
            // Calculate total orders and revenue
            const totalOrders = orderHistory.length;
            const totalRevenue = orderHistory.reduce((sum, order) => sum + order.total, 0);
            
            // Calculate today's orders
            const today = new Date().toDateString();
            const todayOrders = orderHistory.filter(order => {
                return new Date(order.orderDate).toDateString() === today;
            }).length;
            
            // Update display
            totalOrdersEl.textContent = totalOrders;
            totalRevenueEl.textContent = `₦${totalRevenue.toLocaleString()}`;
            todayOrdersEl.textContent = todayOrders;
        }
        
        function clearOrderHistory() {
            if (confirm('Are you sure you want to clear all order history? This action cannot be undone.')) {
                orderHistory = [];
                refreshOrderHistory();
                updateOrderStatistics();
                alert('✅ Order history has been cleared!');
            }
        }
        
        function exportOrderHistory() {
            if (orderHistory.length === 0) {
                alert('No orders to export!');
                return;
            }
            
            // Create CSV content
            let csvContent = 'Order Number,Date,Time,Customer Name,Phone,Email,Address,Items,Total,Payment Method,Status\n';
            
            orderHistory.forEach(order => {
                const orderDate = new Date(order.orderDate);
                const formattedDate = orderDate.toLocaleDateString();
                const formattedTime = orderDate.toLocaleTimeString();
                
                const itemsText = order.items.map(item => `${item.name} x${item.quantity}`).join('; ');
                const paymentText = order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Bank Transfer';
                
                csvContent += `${order.orderNumber},"${formattedDate}","${formattedTime}","${order.customerName}","${order.customerPhone}","${order.customerEmail}","${order.customerAddress}","${itemsText}",${order.total},"${paymentText}","${order.status}"\n`;
            });
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `order_history_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('📊 Order history exported successfully!');
        }
        
        function viewOrderDetails(orderNum) {
            const order = orderHistory.find(o => o.orderNumber === orderNum);
            if (!order) return;
            
            const orderDate = new Date(order.orderDate);
            const formattedDateTime = orderDate.toLocaleString();
            
            const paymentMethods = {
                'cash': '💵 Cash on Delivery',
                'bank': '🏦 Bank Transfer'
            };
            
            let itemsDetails = '';
            order.items.forEach(item => {
                itemsDetails += `${item.emoji} ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}\n`;
            });
            
            const details = `
Order #${order.orderNumber}
Date & Time: ${formattedDateTime}

Customer Information:
Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}
Address: ${order.customerAddress}

Items Ordered:
${itemsDetails}
Total: ₦${order.total.toLocaleString()}

Payment Method: ${paymentMethods[order.paymentMethod]}
Status: ${order.status}
            `;
            
            alert(details);
        }
        
        // Copy account number function
        function copyAccountNumber() {
            const accountNumber = '2087654321';
            
            // Try to use the modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(accountNumber).then(() => {
                    showCopySuccess();
                }).catch(() => {
                    fallbackCopy(accountNumber);
                });
            } else {
                // Fallback for older browsers or non-secure contexts
                fallbackCopy(accountNumber);
            }
        }
        
        function fallbackCopy(text) {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopySuccess();
            } catch (err) {
                alert('Unable to copy. Please manually copy: ' + text);
            } finally {
                document.body.removeChild(textArea);
            }
        }
        
        function showCopySuccess() {
            // Find the copy button and temporarily change its text
            const copyBtn = event.target;
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.classList.add('bg-green-100', 'text-green-700');
            copyBtn.classList.remove('bg-blue-100', 'text-blue-700');
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('bg-green-100', 'text-green-700');
                copyBtn.classList.add('bg-blue-100', 'text-blue-700');
            }, 2000);
        }
    </script>