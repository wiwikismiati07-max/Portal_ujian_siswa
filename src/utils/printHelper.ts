// Utility to handle robust printing in any browser environment, including iframe sandbox
export function printInStandaloneWindow(
  title: string,
  printableHtml: string,
  initialOrientation: 'portrait' | 'landscape' = 'portrait'
) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // If popup blocker intervened, fallback to current window print
      window.print();
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - UPT SMPN 7 Pasuruan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style id="page-orientation-style">
    @page {
      size: A4 ${initialOrientation};
      margin: ${initialOrientation === 'landscape' ? '8mm 10mm 10mm 10mm' : '10mm 12mm 12mm 12mm'};
    }
  </style>
  <style>
    body {
      background-color: #ffffff;
      color: #000000;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0;
      padding: 0;
      width: 100%;
    }
    .break-inside-avoid {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .font-arabic {
      font-family: 'Amiri', serif;
    }
    table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse;
      page-break-inside: auto;
      table-layout: fixed;
    }
    th, td {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
      }
    }
  </style>
</head>
<body class="bg-white text-black p-4 sm:p-8 ${initialOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto" id="body-container">
  <!-- Top Navigation Control (Hidden when printing) -->
  <div class="no-print mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
    <div class="flex items-center gap-2.5">
      <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
        🖨️
      </div>
      <div>
        <h4 class="font-extrabold text-sm text-slate-900">${title}</h4>
        <p class="text-xs text-slate-500">Sesuaikan orientasi (Portrait / Landscape) agar seluruh tabel masuk lembar A4 tanpa terpotong.</p>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <button id="btn-portrait" onclick="setOrientation('portrait')" class="px-3 py-1.5 ${initialOrientation === 'portrait' ? 'bg-indigo-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-700'} text-xs rounded-xl transition-all cursor-pointer">
        📄 Portrait (Tegak)
      </button>
      <button id="btn-landscape" onclick="setOrientation('landscape')" class="px-3 py-1.5 ${initialOrientation === 'landscape' ? 'bg-indigo-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-700'} text-xs rounded-xl transition-all cursor-pointer">
        📃 Landscape (Mendatar)
      </button>
      <button onclick="window.print()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-2">
        <span>Cetak Sekarang</span>
      </button>
      <button onclick="window.close()" class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer">
        Tutup
      </button>
    </div>
  </div>

  <!-- Document Body Content -->
  <div id="print-area" class="w-full">
    ${printableHtml}
  </div>

  <script>
    let currentOrient = '${initialOrientation}';
    function setOrientation(orient) {
      currentOrient = orient;
      const styleEl = document.getElementById('page-orientation-style');
      if (styleEl) {
        styleEl.innerHTML = '@page { size: A4 ' + orient + '; margin: ' + (orient === 'landscape' ? '8mm 10mm 10mm 10mm' : '10mm 12mm 12mm 12mm') + '; }';
      }
      const body = document.getElementById('body-container');
      const btnPort = document.getElementById('btn-portrait');
      const btnLand = document.getElementById('btn-landscape');
      if (orient === 'landscape') {
        body.className = 'bg-white text-black p-4 sm:p-8 max-w-6xl mx-auto';
        btnLand.className = 'px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer';
        btnPort.className = 'px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl transition-all cursor-pointer';
      } else {
        body.className = 'bg-white text-black p-4 sm:p-8 max-w-4xl mx-auto';
        btnPort.className = 'px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer';
        btnLand.className = 'px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl transition-all cursor-pointer';
      }
    }

    // Trigger print automatically once loaded
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.error(e);
        }
      }, 500);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  } catch (err) {
    console.error('Failed to open print window:', err);
    try {
      window.print();
    } catch (e) {
      console.error('Direct window.print() failed:', e);
    }
  }
}
