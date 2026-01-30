// export.js
import * as XLSX from 'https://unpkg.com/xlsx/xlsx.mjs';

export async function exportToExcel(absensiData) {
    try {
        // Prepare data for Excel
        const excelData = absensiData.map(item => ({
            'Nama': item.nama,
            'Jabatan': item.jabatan,
            'Regional': item.regional,
            'Sekolah': item.sekolah,
            'Status': item.status,
            'Keterangan': item.keterangan,
            'Tanggal': item.tanggal,
            'Waktu': item.waktu,
            'Kegiatan': item.kegiatan
        }));
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Absensi");
        
        // Generate Excel file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        // Create blob and download
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `absensi-foksi-${new Date().toISOString().split('T')[0]}.xlsx`;
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