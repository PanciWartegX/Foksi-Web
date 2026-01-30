// export.js - Export to Excel Function
export async function exportToExcel(absensiData, filename = 'absensi-foksi') {
    try {
        // Prepare data for Excel
        const excelData = absensiData.map(item => ({
            'Nama': item.nama || '-',
            'Jabatan': item.jabatan || '-',
            'Regional': item.regional || '-',
            'Sekolah': item.sekolah || '-',
            'Status': getStatusText(item.status),
            'Keterangan': item.keterangan || '-',
            'Tanggal': item.tanggal || '-',
            'Waktu': item.waktu || '-',
            'Kegiatan': item.kegiatan || '-'
        }));
        
        // Create CSV content
        const headers = Object.keys(excelData[0]);
        const csvContent = [
            headers.join(','),
            ...excelData.map(row => 
                headers.map(header => 
                    `"${String(row[header] || '').replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        // Create blob and download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true, message: "Export berhasil" };
    } catch (error) {
        console.error("Export error:", error);
        throw error;
    }
}

function getStatusText(status) {
    const statusMap = {
        'H': 'Hadir',
        'I': 'Izin',
        'S': 'Sakit',
        'A': 'Alpa'
    };
    return statusMap[status] || status || '-';
}