// JavaScript Logic
const itemForm = document.getElementById('itemForm');
const buyerDetailsContainer = document.getElementById('buyerDetails');
const notaItemsContainer = document.getElementById('notaItems');
const totalPriceElement = document.getElementById('totalPrice');
const imageButton = document.getElementById('imageButton');
const paymentStatusDisplay = document.getElementById('paymentStatusDisplay');
const keteranganElement = document.querySelector('.keterangan');
const notaTitleElement = document.getElementById('notaTitle');

let items = [];
let totalPrice = 0;

// Function to format currency in IDR with "Rp." and "-".
function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `Rp. ${formatted},-`;
}

// Function to format date as "19 Maret 2025"
function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

// Function to render nota items
function renderNota() {
  notaItemsContainer.innerHTML = '';
  totalPrice = 0;

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'nota-item d-flex justify-content-between align-items-center';
    itemDiv.innerHTML = `
      <div>
        <strong>${item.name}</strong> - ${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(itemTotal)}
      </div>
      <button class="delete-btn" onclick="deleteItem(${index})">Hapus</button>
    `;
    notaItemsContainer.appendChild(itemDiv);
  });

  totalPriceElement.textContent = formatCurrency(totalPrice);

  // Enable or disable buttons based on items length
  if (items.length > 0) {
    imageButton.disabled = false;
  } else {
    imageButton.disabled = true;
  }
}

// Handle form submission
itemForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const notaDateInput = document.getElementById('notaDate').value;
  const buyerName = document.getElementById('buyerName').value.trim();
  const buyerAddress = document.getElementById('buyerAddress').value.trim();
  const itemName = document.getElementById('itemName').value.trim();
  const itemPrice = parseFloat(document.getElementById('itemPrice').value);
  const itemQuantity = parseInt(document.getElementById('itemQuantity').value);
  const notaType = document.getElementById('notaType').value;
  const paymentStatus = document.getElementById('paymentStatus').value;

  // Use current date if no date is provided
  const currentDate = notaDateInput ? new Date(notaDateInput) : new Date();
  const formattedDate = formatDate(currentDate);

  if (buyerName && buyerAddress && itemName && itemPrice > 0 && itemQuantity > 0) {
    // Check if the buyer details already exist
    const existingBuyer = items.find(
      item => item.buyerName === buyerName && item.buyerAddress === buyerAddress
    );

    if (!existingBuyer) {
      // If buyer details don't exist, add them
      buyerDetailsContainer.innerHTML = `
        <p><strong>Tanggal:</strong> ${formattedDate}</p>
        <p><strong>Nama Pembeli:</strong> ${buyerName}</p>
        <p><strong>Alamat/Toko:</strong> ${buyerAddress}</p>
      `;
    }

    // Add the new item
    items.push({
      buyerName: buyerName,
      buyerAddress: buyerAddress,
      name: itemName,
      price: itemPrice,
      quantity: itemQuantity,
      notaType: notaType,
      paymentStatus: paymentStatus
    });

    // Update nota title based on nota type
    if (notaType === 'tagihan') {
      notaTitleElement.textContent = '--- Nota Tagihan: ---';
    } else {
      notaTitleElement.textContent = '--- Nota: ---';
    }

    // Update payment status display
    if (paymentStatus === 'LUNAS') {
      paymentStatusDisplay.textContent = 'LUNAS';
      paymentStatusDisplay.className = 'payment-status-lunas'; // Apply bold styling
      keteranganElement.style.display = 'block'; // Show keterangan
    } else if (paymentStatus === 'BELUM LUNAS') {
      paymentStatusDisplay.textContent = 'BELUM LUNAS';
      paymentStatusDisplay.className = 'payment-status-belum-lunas'; // Apply bold red styling
      keteranganElement.style.display = 'block'; // Show keterangan
    } else {
      keteranganElement.style.display = 'none'; // Hide keterangan
    }

    renderNota(); // Render the updated nota

    // Show SweetAlert2 success notification
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Item berhasil ditambahkan ke nota.',
      timer: 2000,
      showConfirmButton: false
    });

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('inputModal'));
    modal.hide();

    // Clear form inputs
    document.getElementById('itemName').selectedIndex = 0; // Reset dropdown
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('notaType').selectedIndex = 0; // Reset nota type
    document.getElementById('paymentStatus').selectedIndex = 0; // Reset payment status
  } else {
    // Show SweetAlert2 error notification
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Silakan isi semua field dengan benar!'
    });
  }
});

// Export to Image
function exportToImage() {
  const notaContainer = document.getElementById('notaContainer');
  const deleteButtons = document.querySelectorAll('.delete-btn'); // Select all delete buttons

  // Temporarily hide delete buttons
  deleteButtons.forEach(button => {
    button.style.visibility = 'hidden'; // Use visibility instead of display
  });

  html2canvas(notaContainer, {
    scale: 10 // Increase resolution by doubling the scale
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png'); // Use PNG for better quality
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'nota.png'; // Save as PNG
    link.click();

    // Restore delete buttons visibility
    deleteButtons.forEach(button => {
      button.style.visibility = 'visible'; // Restore visibility
    });
  });
}

// Delete a specific item
function deleteItem(index) {
  // Remove the item from the array
  const removedItem = items.splice(index, 1)[0];
  const itemTotal = removedItem.price * removedItem.quantity;

  // Update total price
  totalPrice -= itemTotal;

  // Re-render the nota
  renderNota();
}