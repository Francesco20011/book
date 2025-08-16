window.addEventListener('message', function(event) {
    console.log("📨 Messaggio ricevuto:", event.data);
    
    if (event.data.show == true) {
        console.log("📖 Apertura libro, pagine:", event.data.pages);
        
        if (event.data.pages) {
            // Pulisci il contenuto precedente
            $('#inner').empty();
            
            // Aggiungi le pagine
            $.each(event.data.pages, function(index, page) {
                // Determina l'immagine da usare
                let imgSrc;
                if (page.pageName === 'pagina') {
                    imgSrc = 'img/pagina.png'; // Usa sempre pagina.png per le pagine normali
                } else {
                    imgSrc = 'img/' + page.pageName + '.png'; // Usa immagini specifiche per copertina, etc
                }
                
                console.log("�️ Carico immagine:", imgSrc);
                
                // Determina se è una pagina hard (copertina)
                const isHardPage = page.type === 'hard' || page.type === 'cover';
                
                // Crea il div della pagina - SEMPRE con immagine
                const pageDiv = `
                    <div class="turn-page" style="width: 512px; height: 768px; position: relative;">
                        <img src="${imgSrc}" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="console.error('❌ Errore caricamento immagine: ${imgSrc}')">
                        ${(!isHardPage && (page.title || page.content)) ? `
                            <div class="text-overlay">
                                ${page.title ? `<h3>${page.title}</h3>` : ''}
                                ${page.content ? `<p>${page.content}</p>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
                
                $('#inner').append(pageDiv);
            });

            // Inizializza turn.js dopo un breve delay
            setTimeout(function() {
                console.log("🔄 Inizializzazione turn.js");
                
                // Distruggi eventuale istanza precedente
                if ($('#inner').hasClass('turn-js')) {
                    $('#inner').turn('destroy');
                }
                
                // Inizializza turn.js
                $('#inner').turn({
                    width: 1024,
                    height: 768,
                    autoCenter: true,
                    elevation: 50,
                    gradients: true,
                    when: {
                        turning: function(event, page, view) {
                            console.log('📖 Girando pagina:', page);
                        }
                    }
                });
                
                console.log("✅ Turn.js inizializzato!");
                
                // Mostra il libro
                $('body').show();
                
            }, 300);
            
        } else {
            console.error("❌ Nessuna pagina trovata!");
        }
        
    } else if (event.data.show == false) {
        console.log("❌ Chiusura libro");
        
        // Nascondi subito
        $('body').hide();
        
        // Pulisci turn.js
        if ($('#inner').hasClass('turn-js')) {
            $('#inner').turn('destroy');
        }
        $('#inner').empty();
        
        // Chiudi NUI con un leggero delay per essere sicuri
        setTimeout(function() {
            $.post('https://gmm-books-esx/close', JSON.stringify({}), function(response) {
                console.log("✅ NUI chiusa correttamente");
            }).fail(function() {
                console.log("⚠️ Errore chiusura NUI, provo con fetch");
                fetch('https://gmm-books-esx/close', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
            });
        }, 50);
    }
});

// Chiusura con ESC
$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        console.log("⌨️ ESC premuto - Chiusura libro");
        $('body').hide();
        
        if ($('#inner').hasClass('turn-js')) {
            $('#inner').turn('destroy');
        }
        $('#inner').empty();
        
        // Chiusura NUI più robusta
        setTimeout(function() {
            $.post('https://gmm-books-esx/close', JSON.stringify({}), function(response) {
                console.log("✅ NUI chiusa con ESC");
            }).fail(function() {
                fetch('https://gmm-books-esx/close', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
            });
        }, 50);
    }
});

// Chiusura con click esterno
$(document).click(function(e) {
    if (!$(e.target).closest('#inner').length) {
        console.log("🖱️ Click esterno - Chiusura libro");
        $('body').hide();
        
        if ($('#inner').hasClass('turn-js')) {
            $('#inner').turn('destroy');
        }
        $('#inner').empty();
        
        // Chiusura NUI più robusta
        setTimeout(function() {
            $.post('https://gmm-books-esx/close', JSON.stringify({}), function(response) {
                console.log("✅ NUI chiusa con click");
            }).fail(function() {
                fetch('https://gmm-books-esx/close', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
            });
        }, 50);
    }
});
