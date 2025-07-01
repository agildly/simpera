document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKSI ELEMEN DOM ---
    const btnTambah = document.getElementById('btn-tambah');
    const itemModal = document.getElementById('item-modal');
    const closeModalButton = document.querySelector('.close-button');
    const itemForm = document.getElementById('item-form');
    const tableBody = document.getElementById('inventory-table-body');
    const searchInput = document.getElementById('search-input');
    const modalTitle = document.getElementById('modal-title');
    const hiddenItemId = document.getElementById('item-id');
    const btnUnduhExcel = document.getElementById('btn-unduh-excel');

    // --- STATE APLIKASI ---
    // Coba ambil data dari localStorage, jika tidak ada, gunakan array contoh
    let inventory = JSON.parse(localStorage.getItem('inventoryData')) || [
        { id: 1, nama: 'PC All-in-One HP 22-df0112d', kategori: 'Komputer', kode: 'DKN-PTK-KOM-001', tanggal: '2023-05-10', lokasi: 'Ruang Sekretariat', status: 'Baik', catatan: 'Digunakan oleh staf umum' },
        { id: 2, nama: 'Printer Epson L3210', kategori: 'Printer', kode: 'DKN-PTK-PRN-003', tanggal: '2022-11-20', lokasi: 'Ruang Bidang TIK', status: 'Baik', catatan: '' },
        { id: 3, nama: 'Laptop ASUS Vivobook 14', kategori: 'Laptop', kode: 'DKN-PTK-LAP-007', tanggal: '2024-01-15', lokasi: 'Kepala Dinas', status: 'Perbaikan', catatan: 'Keyboard error' },
        { id: 4, nama: 'Router Cisco RV340', kategori: 'Jaringan', kode: 'DKN-PTK-JAR-002', tanggal: '2023-02-01', lokasi: 'Ruang Server', status: 'Rusak', catatan: 'Port 3 dan 4 mati.' }
    ];

    // --- FUNGSI ---

    // Fungsi untuk menyimpan data ke localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('inventoryData', JSON.stringify(inventory));
    };
    // Fungsi untuk mengunduh data inventaris sebagai file Excel
    const unduhExcel = () => {
    // 1. Siapkan data, hapus 'id' agar tidak ikut terunduh
    const dataToExport = inventory.map(item => {
        return {
            "Nama Peralatan": item.nama,
            "Kategori": item.kategori,
            "Kode Inventaris": item.kode,
            "Tanggal Pengadaan": item.tanggal,
            "Lokasi": item.lokasi,
            "Status": item.status,
            "Catatan": item.catatan
        };
    });

    // 2. Buat worksheet dari array of objects
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Buat workbook baru
    const workbook = XLSX.utils.book_new();

    // 4. Tambahkan worksheet ke workbook dengan nama "Data Inventaris"
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Inventaris");

    // 5. Atur lebar kolom agar lebih rapi (opsional)
    worksheet["!cols"] = [
        { wch: 30 }, // Nama Peralatan
        { wch: 15 }, // Kategori
        { wch: 20 }, // Kode Inventaris
        { wch: 15 }, // Tanggal Pengadaan
        { wch: 20 }, // Lokasi
        { wch: 12 }, // Status
        { wch: 40 }  // Catatan
    ];

    // 6. Generate file Excel dan trigger unduhan
    XLSX.writeFile(workbook, "Laporan_Inventaris_Diskominfo.xlsx");
    };

    // Fungsi untuk merender (menampilkan) data ke tabel
    const renderTable = (data = inventory) => {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Data tidak ditemukan.</td></tr>';
            return;
        }

        data.forEach((item, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.nama}</td>
                    <td>${item.kategori}</td>
                    <td>${item.kode}</td>
                    <td>${item.tanggal}</td>
                    <td>${item.lokasi}</td>
                    <td><span class="status status-${item.status.replace(' ', '')}">${item.status}</span></td>
                    <td>
                        <button class="btn-aksi btn-edit" data-id="${item.id}">Ubah</button>
                        <button class="btn-aksi btn-hapus" data-id="${item.id}">Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        updateDashboard();
    };
    
    // Fungsi untuk update data di dashboard
    const updateDashboard = () => {
        document.getElementById('total-items').textContent = inventory.length;
        document.getElementById('status-baik').textContent = inventory.filter(item => item.status === 'Baik').length;
        document.getElementById('status-perbaikan').textContent = inventory.filter(item => item.status === 'Perbaikan').length;
        document.getElementById('status-rusak').textContent = inventory.filter(item => item.status === 'Rusak').length;
    };


    // Fungsi untuk membuka modal
    const openModal = () => itemModal.style.display = 'flex';

    // Fungsi untuk menutup modal
    const closeModal = () => itemModal.style.display = 'none';

    // Fungsi untuk mereset form
    const resetForm = () => {
        itemForm.reset();
        hiddenItemId.value = '';
        modalTitle.textContent = 'Tambah Peralatan Baru';
    };

    // Fungsi untuk mengisi form saat mode edit
    const populateForm = (item) => {
        document.getElementById('item-id').value = item.id;
        document.getElementById('nama').value = item.nama;
        document.getElementById('kategori').value = item.kategori;
        document.getElementById('kode').value = item.kode;
        document.getElementById('tanggal').value = item.tanggal;
        document.getElementById('lokasi').value = item.lokasi;
        document.getElementById('status').value = item.status;
        document.getElementById('catatan').value = item.catatan;
        modalTitle.textContent = 'Ubah Data Peralatan';
    };

    // --- EVENT LISTENERS ---
    // Tombol Unduh Excel
    btnUnduhExcel.addEventListener('click', unduhExcel);
    // Tombol Tambah: Buka modal dan reset form
    btnTambah.addEventListener('click', () => {
        resetForm();
        openModal();
    });

    // Tombol Close di Modal
    closeModalButton.addEventListener('click', closeModal);

    // Klik di luar modal akan menutup modal
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeModal();
        }
    });

    // Submit Form (Tambah atau Edit)
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = hiddenItemId.value;
        const newItemData = {
            nama: document.getElementById('nama').value,
            kategori: document.getElementById('kategori').value,
            kode: document.getElementById('kode').value,
            tanggal: document.getElementById('tanggal').value,
            lokasi: document.getElementById('lokasi').value,
            status: document.getElementById('status').value,
            catatan: document.getElementById('catatan').value,
        };

        if (id) { // Mode Edit
            const itemIndex = inventory.findIndex(item => item.id == id);
            inventory[itemIndex] = { id: parseInt(id), ...newItemData };
        } else { // Mode Tambah
            newItemData.id = inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1;
            inventory.push(newItemData);
        }

        saveToLocalStorage();
        renderTable();
        closeModal();
    });
    
    // Aksi pada Tabel (Ubah dan Hapus) - Event Delegation
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');

        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            const itemToEdit = inventory.find(item => item.id == id);
            if (itemToEdit) {
                populateForm(itemToEdit);
                openModal();
            }
        }

        if (target.classList.contains('btn-hapus')) {
            if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
                inventory = inventory.filter(item => item.id != id);
                saveToLocalStorage();
                renderTable();
            }
        }
    });

    // Pencarian
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = inventory.filter(item => 
            item.nama.toLowerCase().includes(searchTerm) ||
            item.kode.toLowerCase().includes(searchTerm) ||
            item.lokasi.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
    });

    // --- INISIALISASI ---
    renderTable();

});