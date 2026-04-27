/* ============================================================
       CONFIGURAÇÃO DO SUPABASE
       ─────────────────────────────────────────────────────────────
       preenchi aqui depois de criar o projeto no supabase.com
       a chave anon é pública mesmo, pode ficar no código
       (serve só pra inserir/ler dados com as políticas que configurei)
    ============================================================ */
    const SUPABASE_URL     = 'https://qnfkobrerakiikadifga.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable__sXClUsRNFDP5S0MdiZgyQ_k0u_1zD2';

    /* ============================================================
       NAVBAR — COMPORTAMENTO DE SCROLL
       ─────────────────────────────────────────────────────────────
       some ao scrollar pra baixo, volta ao scrollar pra cima
       uso requestAnimationFrame pra não travar a animação
       (sem ele o evento scroll dispara muitas vezes por segundo
       e fica lagando — aprendi isso na prática, claro)
    ============================================================ */
    const navbar  = document.getElementById('navbar');
    const fabBtn  = document.getElementById('fab-btn');
    let lastScrollY = window.scrollY;
    let ticking     = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY    = window.scrollY;
          const scrollingDown     = currentScrollY > lastScrollY;
          const pastThreshold     = currentScrollY > 80;   /* só some depois de 80px */
          const pastButtonThreshold = currentScrollY > 200; /* botão aparece depois de 200px */

          /* esconde ou mostra o navbar com CSS transform */
          navbar.style.transform = (scrollingDown && pastThreshold)
            ? 'translateY(-100%)'
            : 'translateY(0)';

          /* controla visibilidade do botão flutuante */
          fabBtn.style.opacity       = pastButtonThreshold ? '1'    : '0';
          fabBtn.style.pointerEvents = pastButtonThreshold ? 'auto' : 'none';

          lastScrollY = currentScrollY;
          ticking     = false;
        });
        ticking = true;
      }
    });

    /* ============================================================
       DRAWER LATERAL
       ─────────────────────────────────────────────────────────────
       menu lateral que desliza da direita no mobile
       abre pelo botão flutuante ou pelo hambúrguer no navbar
       fecha clicando no overlay, no X ou em qualquer link
    ============================================================ */
    const drawer        = document.getElementById('drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose   = document.getElementById('drawer-close');
    const navHamburger  = document.getElementById('nav-hamburger');

    function openDrawer() {
      drawer.classList.add('open');
      drawerOverlay.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      drawerClose.focus(); /* foco vai pro botão de fechar (acessibilidade) */
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      drawerOverlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }

    fabBtn.addEventListener('click', openDrawer);
    navHamburger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    /* fecha o drawer quando clica num link de navegação */
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    /* Escape fecha tanto o drawer quanto o lightbox */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        closeLightbox();
      }
    });

    /* ===
       LIGHTBOX DE VÍDEO
       ───
       ok então. eu vou precisar contar o que aconteceu aqui porque
       esse bloco de código representa 2 horas da minha vida que
       eu não vou recuperar.
       
       tent 1: coloquei o iframe direto no html com a url do youtube.
       funcionou no meu computador. não funcionou em mais lugar nenhum.
       erro 153. "video player configuration error". ok vou pesquisar.
       
       tent 2: li que tinha que usar youtube-nocookie.com.
       troquei a url. mesmo erro. 
       
       tent 3: li que era problema de cors. adicionei allow no iframe.
       mesmo erro. minha fé estava abalada.
       
       tent 4: apaguei tudo e coloquei o iframe de volta do zero.
       mesma coisa. eu não sei o que tô fazendo.
       
       tent 5: li que o problema era o referrer policy.
       adicionei a meta tag no head. parece que funcionou? não. ainda erro.
       mas às vezes carregava? tipo, 1 em cada 5 tentativas funcionava.
       eu não sei o que está acontecendo com a minha vida.
       
       tent 6: li mais fundo. percebi que precisava do referrerpolicy
       no próprio iframe também, não só na meta tag. adicionei. melhorou.
       mas ainda falhava quando abria o arquivo direto pelo explorador de
       arquivos (protocolo file://) em vez de pelo servidor.
       
       tent 7: mudei pra criar o iframe dinamicamente ao clicar
       em vez de pré-carregado. isso é o "facade pattern". funcionou melhor.
       
       tent 8 (a que funcionou de verdade): li a documentação do
       youtube mais a fundo. e aí eu vi. eu VIR. lá no link do vídeo
       que eu tinha copiado da url do navegador. tinha um caractere errado.
       
       era: youtube.com/vi/V=OBe1-nenr64  (V maiúsculo)
       certo: youtube.com/vi/OBe1-nenr64  (Porra de V tnc)
       
       EU PASSEI 2 HORAS CONFIGURANDO REFERRER POLICY, CORS, NOCOOKIE,
       FACADE PATTERN, PRECONNECT, POLICY NO IFRAME E NA META TAG,
       POR CAUSA DE UM 'v' MINÚSCULO IMUNDO NA URL DO YOUTUBE.
       
       n. n vou falar mais sobre isso. o codigo ta certo agora.
       vamos em frente.
    ============================================================ */
    const lightbox      = document.getElementById('lightbox');
    const lightboxInner = lightbox.querySelector('.lightbox-inner');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(videoId, videoTitle) {
      /* registra o clique no supabase antes de abrir o player */
      registerVideoPlay(videoId, videoTitle);

      /* cria o iframe dinamicamente — não pré-carregado
         isso é o facade pattern: a thumbnail é exibida,
         o iframe só existe depois do clique do usuário */
      const iframe = document.createElement('iframe');
      iframe.src = [
        `https://www.youtube-nocookie.com/embed/${videoId}`, /* nocookie = menos rastreamento */
        `?autoplay=1`,          /* autoplay porque o usuário acabou de clicar */
        `&rel=0`,               /* sem vídeos relacionados de outros canais */
        `&modestbranding=1`,    /* sem logo do youtube enorme no player */
        `&origin=${encodeURIComponent(location.origin || location.href.split('/').slice(0,3).join('/'))}`,
      ].join('');

      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.title = videoTitle; /* acessibilidade: título do iframe pra leitores de tela */

      /* referrerpolicy aqui no iframe pra não depender só da meta tag no head
         cobre casos onde o servidor tem um header que sobrescreve a meta tag */
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';

      /* frameBorder é obsoleto mas coloco pra compatibilidade com browsers antigos
         o border: none no css já faz o trabalho real */
      iframe.frameBorder = '0';

      lightboxInner.appendChild(iframe);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      lightboxClose.focus(); /* foco no botão de fechar pra acessibilidade */
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      /* remove o iframe do dom ao fechar — pausa o vídeo automaticamente
         e libera a conexão de rede com os servidores do youtube */
      const iframe = lightboxInner.querySelector('iframe');
      if (iframe) iframe.remove();
    }

    lightboxClose.addEventListener('click', closeLightbox);

    /* fecha lightbox ao clicar no overlay escuro (fora do player) */
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    /* ativa as thumbnails de vídeo com clique e suporte a teclado */
    document.querySelectorAll('.video-thumb-wrap').forEach(wrap => {

      /* preconnect dinâmico no hover — inicia o handshake tcp/tls com o youtube
         antes do clique, reduz a latência percebida ao abrir o player
         usa { once: true } pra o listener se auto-remover depois do primeiro hover */
      let preconnected = false;
      wrap.addEventListener('mouseenter', () => {
        if (preconnected) return;
        preconnected = true;
        ['https://www.youtube-nocookie.com', 'https://i.ytimg.com'].forEach(origin => {
          const link = document.createElement('link');
          link.rel  = 'preconnect';
          link.href = origin;
          document.head.appendChild(link);
        });
      }, { once: true });

      const activate = () => {
        const videoId    = wrap.dataset.videoId;
        const videoTitle = wrap.dataset.videoTitle || 'Vídeo';

        /* aviso se alguém esqueceu de substituir o placeholder do id do vídeo */
        if (!videoId || videoId === '[ID_DO_VIDEO_1]' || videoId === '[ID_DO_VIDEO_2]') {
          alert('⚠️ Substitua o placeholder [ID_DO_VIDEO_X] pelo ID real do YouTube neste arquivo HTML.\n\nExemplo: se o vídeo é youtube.com/watch?v=dQw4w9WgXcQ, o ID é "dQw4w9WgXcQ".\n\n(E USE v MINÚSCULO. APRENDI DA PIOR FORMA.)');
          return;
        }
        openLightbox(videoId, videoTitle);
      };

      wrap.addEventListener('click', activate);
      /* suporte a teclado: Enter e Espaço ativam o vídeo (acessibilidade) */
      wrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });

    /* ============================================================
       REGISTRO DE VISITA — SUPABASE
       ─────────────────────────────────────────────────────────────
       faz hash sha-256 do ip do visitante antes de salvar
       pra não guardar o ip em texto puro (lgpd, privacidade, etc)
       o hash é irreversível mas ainda permite contar visitantes únicos
    ============================================================ */
    async function registerVisit() {
      /* se os placeholders não foram substituídos, pula silenciosamente */
      if (SUPABASE_URL === '[SUPABASE_URL]' || SUPABASE_ANON_KEY === '[SUPABASE_ANON_KEY]') {
        console.info('Supabase não configurado — analytics desativado.');
        return;
      }

      try {
        /* pega o ip via api pública */
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip }     = await ipResponse.json();

        /* gera hash sha-256 do ip com salt fixo */
        const encoder    = new TextEncoder();
        const data       = encoder.encode(ip + 'salt_bullying_site');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray  = Array.from(new Uint8Array(hashBuffer));
        const ipHash     = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        /* detecta de onde o visitante veio pelo query param ?ref= */
        const params  = new URLSearchParams(window.location.search);
        const refMap  = { turma: 'turma', qrcode: 'qrcode', cartaz: 'cartaz', whatsapp: 'whatsapp' };
        const source  = refMap[params.get('ref')] || 'direct';

        /* insere no banco */
        await fetch(`${SUPABASE_URL}/rest/v1/page_visits`, {
          method: 'POST',
          headers: {
            'Content-Type'  : 'application/json',
            'apikey'        : SUPABASE_ANON_KEY,
            'Authorization' : `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer'        : 'return=minimal' /* não precisa retornar o registro inserido */
          },
          body: JSON.stringify({
            ip_address : ip,
            ip_hash    : ipHash,
            source     : source,
            user_agent : navigator.userAgent.substring(0, 200) /* limita tamanho do campo */
          })
        });
      } catch (e) {
        /* falha silenciosa — o analytics não pode quebrar a experiência do usuário */
        console.warn('Analytics de visita não disponível:', e.message);
      }
    }

    /* ============================================================
       REGISTRO DE PLAY DE VÍDEO — SUPABASE
       ─────────────────────────────────────────────────────────────
       mesma lógica do registro de visita mas pra quando alguém
       clica pra assistir um vídeo. grava qual vídeo foi assistido.
    ============================================================ */
    async function registerVideoPlay(videoId, videoTitle) {
      if (SUPABASE_URL === '[SUPABASE_URL]' || SUPABASE_ANON_KEY === '[SUPABASE_ANON_KEY]') return;

      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip }     = await ipResponse.json();

        const encoder    = new TextEncoder();
        const data       = encoder.encode(ip + 'salt_bullying_site');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray  = Array.from(new Uint8Array(hashBuffer));
        const ipHash     = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        await fetch(`${SUPABASE_URL}/rest/v1/video_plays`, {
          method: 'POST',
          headers: {
            'Content-Type'  : 'application/json',
            'apikey'        : SUPABASE_ANON_KEY,
            'Authorization' : `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer'        : 'return=minimal'
          },
          body: JSON.stringify({ video_id: videoId, video_title: videoTitle, ip_hash: ipHash })
        });
      } catch (e) {
        console.warn('Analytics de vídeo não disponível:', e.message);
      }
    }

    /* ============================================================
       CARREGAR ESTATÍSTICAS DO SUPABASE
       ─────────────────────────────────────────────────────────────
       busca os dados nas views que criei no supabase e preenche
       os cards de métricas e as barras de proporção por fonte
    ============================================================ */
    async function loadStats() {
      if (SUPABASE_URL === '[SUPABASE_URL]' || SUPABASE_ANON_KEY === '[SUPABASE_ANON_KEY]') {
        /* sem configuração: mostra N/A em vez de travar */
        ['stat-unique','stat-today','stat-videos','stat-total'].forEach(id => {
          document.getElementById(id).textContent = 'N/A';
        });
        ['turma','qrcode','cartaz','whatsapp','direct'].forEach(src => {
          document.getElementById(`count-${src}`).textContent = 'N/A';
        });
        return;
      }

      try {
        /* busca visitas da view public_stats (criada no supabase) */
        const visitsRes = await fetch(`${SUPABASE_URL}/rest/v1/public_stats`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const visits = await visitsRes.json();

        /* busca plays de vídeo da view public_video_stats */
        const videoRes = await fetch(`${SUPABASE_URL}/rest/v1/public_video_stats`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const videos = await videoRes.json();

        if (visits && visits[0]) {
          const v = visits[0];

          document.getElementById('stat-unique').textContent =
            (v.unique_visitors || 0).toLocaleString('pt-BR');
          document.getElementById('stat-today').textContent =
            (v.visitors_today || 0).toLocaleString('pt-BR');

          /* soma todas as fontes pra obter o total geral */
          const total = (v.from_turma || 0) + (v.from_qrcode || 0) +
                        (v.from_cartaz || 0) + (v.from_whatsapp || 0) +
                        (v.from_direct || 0);
          document.getElementById('stat-total').textContent =
            total.toLocaleString('pt-BR');

          /* calcula as barras de proporção */
          const sources = {
            turma   : v.from_turma    || 0,
            qrcode  : v.from_qrcode   || 0,
            cartaz  : v.from_cartaz   || 0,
            whatsapp: v.from_whatsapp || 0,
            direct  : v.from_direct   || 0
          };

          /* pega o maior valor pra normalizar as barras (100% = maior fonte) */
          const maxVal = Math.max(...Object.values(sources), 1);

          Object.entries(sources).forEach(([src, count]) => {
            const barEl   = document.getElementById(`bar-${src}`);
            const countEl = document.getElementById(`count-${src}`);
            if (barEl)   barEl.style.width       = `${Math.round((count / maxVal) * 100)}%`;
            if (countEl) countEl.textContent = count.toLocaleString('pt-BR');
          });
        }

        /* total de vídeos assistidos */
        if (Array.isArray(videos)) {
          const totalPlays = videos.reduce((acc, v) => acc + (v.play_count || 0), 0);
          document.getElementById('stat-videos').textContent =
            totalPlays.toLocaleString('pt-BR');
        }

      } catch (e) {
        console.warn('Não foi possível carregar as estatísticas:', e.message);
        ['stat-unique','stat-today','stat-videos','stat-total'].forEach(id => {
          document.getElementById(id).textContent = 'N/A';
        });
      }
    }

    /* ============================================================
       INICIALIZAÇÃO
       ─────────────────────────────────────────────────────────────
       roda tudo quando o dom tiver carregado
       (o DOMContentLoaded garante que os elementos já existem no html)
    ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {
      registerVisit(); /* registra a visita no banco */
      loadStats();     /* carrega e exibe as estatísticas */
    });
