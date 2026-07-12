document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase
    const SUPABASE_URL = 'https://lwzcinuzqgogrgsgfnjf.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_yu0syRT8oiLCD2tz-K8ipA_KUiyFrbU';
    let supabase = null;
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    // --- Funções Globais (Ações de Tabela) ---
    window.deletarCliente = async (id, element) => {
        if (!confirm('Tem certeza que deseja excluir permanentemente este cliente?')) return;

        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';

        if (window.supabase && id && id !== 'null' && id !== 'undefined') {
            try {
                const { error } = await supabase.from('alunos').delete().eq('id', id);
                if (error) throw error;
            } catch (e) {
                console.error("Erro ao excluir do Supabase", e);
                alert("Erro ao excluir do banco de dados.");
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
                return;
            }
        }

        element.remove();
        const lblAlunos = document.getElementById('kpi-alunos');
        if (lblAlunos) {
            const current = parseInt(lblAlunos.innerText || '0');
            lblAlunos.innerText = current > 0 ? current - 1 : 0;
        }
    };

    window.editarCliente = (clienteDataStr) => {
        let c;
        try { c = JSON.parse(decodeURIComponent(clienteDataStr)); } catch (e) { return; }
        const id = c.id;
        if (!id || id === 'null') { alert('Erro: Cliente sem ID no banco remoto.'); return; }
        const slideOver = document.getElementById('slide-over-novo');
        if (!slideOver) return;

        const title = slideOver.querySelector('h2');
        if (title) title.innerText = 'Editar Cadastro';

        const setVal = (elmId, val) => {
            const el = document.getElementById(elmId);
            if (el) el.value = (val !== null && val !== undefined && val !== 'null') ? val : '';
        };

        setVal('ipt-nome', c.nome);
        setVal('ipt-telefone', formatPhoneBR(c.telefone));
        setVal('ipt-nascimento', c.data_nascimento);
        setVal('ipt-cpf', c.cpf);
        setVal('ipt-email', c.email);
        setVal('ipt-endereco', c.endereco);
        setVal('ipt-emergencia', formatPhoneBR(c.contato_emergencia));
        setVal('ipt-inicio', c.data_inicio);
        setVal('ipt-valor', c.valor_ciclo);
        setVal('ipt-vencimento', c.dia_vencimento);
        setVal('ipt-instrutor', c.instrutor);
        setVal('ipt-saude', c.observacoes_saude);

        const iptModal = document.getElementById('ipt-modalidade');
        if (iptModal) {
            const exists = Array.from(iptModal.options).some(o => o.value === c.plano);
            iptModal.value = exists ? c.plano : "";
        }
        const iptPag = document.getElementById('ipt-pagamento');
        if (iptPag) iptPag.value = c.modalidade_pagamento || "Mensal";

        const iptStatus = document.getElementById('ipt-status');
        if (iptStatus && c.status) iptStatus.value = c.status;

        const btnSalvar = document.getElementById('btn-registar-aluno');
        if (btnSalvar) btnSalvar.dataset.editId = id;

        slideOver.classList.remove('hidden-overlay');
        setTimeout(() => { slideOver.classList.add('open'); }, 10);
    };

    const formatDataBR = (v) => {
        if (!v) return '';
        if (v.includes('-')) {
            const p = v.split('-');
            if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (v.length === 8 && !v.includes('/')) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
        }
        return v;
    };

    const formatPhoneBR = (v) => {
        if (!v) return '';
        const d = v.replace(/\D/g, '');
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return v;
    };

    // Live mask bindings for editing form
    const applyPhoneMask = (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
            e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 6) {
            e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
        } else if (v.length > 2) {
            e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        } else if (v.length > 0) {
            e.target.value = `(${v}`;
        }
    };

    document.getElementById('ipt-telefone').addEventListener('input', applyPhoneMask);
    document.getElementById('ipt-emergencia').addEventListener('input', applyPhoneMask);

    window.verPerfilCompleto = (clienteDataStr) => {
        let c;
        try { c = JSON.parse(decodeURIComponent(clienteDataStr)); } catch (e) { return; }

        // Esconder todas as views ativas e tirar highlight do menu
        document.querySelectorAll('main.main-surface > .view, .view').forEach(view => view.classList.add('hidden'));
        document.querySelectorAll('.sidebar-fixed .nav-item, .sidebar-slim .nav-item').forEach(nav => nav.classList.remove('active'));

        // Mostrar Ficha do Aluno
        const fichaView = document.getElementById('view-ficha-aluno');
        if (!fichaView) return;
        fichaView.classList.remove('hidden');

        // Renderizar Informações do Cliente no Topo
        const avt = document.getElementById('ficha-aluno-avatar');
        if (avt) avt.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome || 'Sem')}&background=E0F2FE&color=0284C7&size=200`;

        const elNome = document.getElementById('ficha-aluno-nome');
        if (elNome) elNome.innerText = c.nome || 'Nome Indisponível';

        const elId = document.getElementById('ficha-aluno-id');
        if (elId) {
            const savedMat = localStorage.getItem(`movia_aluno_matricula_${c.id}`);
            elId.value = savedMat || c.id || (Math.floor(Math.random() * 90) + 10);
            elId.onchange = (e) => {
                if (e.target.value) {
                    localStorage.setItem(`movia_aluno_matricula_${c.id}`, e.target.value);
                    if (typeof loadClientes === 'function') loadClientes();
                }
            };
        }

        const elIdade = document.getElementById('ficha-aluno-idade');
        if (elIdade && c.data_nascimento) {
            let age = '--';
            if (c.data_nascimento.includes('-')) {
                const parts = c.data_nascimento.split('-');
                if (parts[0].length === 4) {
                    age = new Date().getFullYear() - parseInt(parts[0]);
                }
            } else if (c.data_nascimento.length >= 8) {
                // ddmmaaaa format
                const yr = c.data_nascimento.substring(4);
                age = new Date().getFullYear() - parseInt(yr);
            }
            elIdade.innerText = (!isNaN(age) && age > 5 && age < 100) ? `${age} anos` : '-- anos';
        } else if (elIdade) {
            elIdade.innerText = '-- anos';
        }

        const elTel = document.getElementById('ficha-aluno-telefone');
        if (elTel) elTel.innerText = formatPhoneBR(c.telefone) || '(Sem telefone)';

        const elResp = document.getElementById('ficha-aluno-resp');
        if (elResp) elResp.innerText = c.contato_emergencia ? 'Familiar Cadastrado' : 'Próprio';

        const btnWpp = document.getElementById('btn-ficha-wpp');
        if (btnWpp) btnWpp.dataset.fone = c.telefone;

        // <--- Persistencia de Nível e Interesses via LocalStorage --->
        const elNivel = document.getElementById('ficha-aluno-nivel');
        if (elNivel) {
            const savedNivel = localStorage.getItem(`movia_aluno_nivel_${c.id}`);
            if (savedNivel) elNivel.value = savedNivel;
            elNivel.onchange = (e) => localStorage.setItem(`movia_aluno_nivel_${c.id}`, e.target.value);
        }

        const elInteresse = document.getElementById('ficha-aluno-interesses');
        if (elInteresse) {
            const savedInt = localStorage.getItem(`movia_aluno_interesses_${c.id}`);
            if (savedInt) elInteresse.value = savedInt;
            elInteresse.onchange = (e) => localStorage.setItem(`movia_aluno_interesses_${c.id}`, e.target.value);
        }

        // <--- Lógica de Troca de Foto de Perfil do Cliente --->
        const btnUploadPic = document.getElementById('btn-troca-foto-cliente');
        const iptUploadPic = document.getElementById('ipt-ficha-upload-foto');
        if (avt) {
            // Tentar puxar foto local
            const savedPic = localStorage.getItem(`movia_aluno_avatar_${c.id}`);
            if (savedPic) avt.src = savedPic;

            if (btnUploadPic && iptUploadPic) {
                btnUploadPic.onclick = () => iptUploadPic.click();
                iptUploadPic.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const b64 = ev.target.result;
                        avt.src = b64;
                        try {
                            localStorage.setItem(`movia_aluno_avatar_${c.id}`, b64);
                        } catch (err) {
                            alert("A imagem é muito grande para salvar no cache do navegador. Tente uma com tamanho menor.");
                        }
                    };
                    reader.readAsDataURL(file);
                };
            }
        }

        // Ligar Botão Voltar
        const btnVoltar = document.getElementById('btn-voltar-alunos');
        if (btnVoltar) {
            btnVoltar.onclick = () => {
                fichaView.classList.add('hidden');
                const targetView = document.getElementById('view-alunos');
                if (targetView) targetView.classList.remove('hidden');
                const itemAlunos = document.querySelector('.nav-item[data-target="alunos"]');
                if (itemAlunos) itemAlunos.classList.add('active');
            };
        }

        const btnEdit = document.getElementById('btn-ficha-editar');
        if (btnEdit) {
            btnEdit.onclick = () => { window.editarCliente(clienteDataStr); };
        }

        const btnDel = document.getElementById('btn-ficha-excluir');
        if (btnDel) {
            btnDel.onclick = () => { alert("Utilize o menu lateral na tabela Base de Alunos para remover clientes em definitivo."); };
        }

        // Preencher Ficha de Edição Direta
        document.getElementById('ficha-ipt-telefone').value = formatPhoneBR(c.telefone) || '';
        document.getElementById('ficha-ipt-email').value = c.email || '';
        document.getElementById('ficha-ipt-cpf').value = c.cpf || '';
        document.getElementById('ficha-ipt-nasc').value = c.data_nascimento || '';
        document.getElementById('ficha-ipt-endereco').value = c.endereco || '';
        document.getElementById('ficha-ipt-emergencia').value = formatPhoneBR(c.contato_emergencia) || '';

        document.getElementById('ficha-ipt-plano').value = c.plano || 'Customizado';
        document.getElementById('ficha-ipt-instrutor').value = c.instrutor || '';
        document.getElementById('ficha-ipt-valor').value = c.valor_ciclo ? c.valor_ciclo : '';
        document.getElementById('ficha-ipt-status').value = c.status || 'Ativo';
        document.getElementById('ficha-ipt-saude').value = c.observacoes_saude || '';

        const fichaEvol = document.getElementById('ficha-ipt-evolucoes');
        if (fichaEvol) fichaEvol.value = localStorage.getItem(`movia_aluno_evolucoes_${c.id}`) || '';

        // Botão Salvar Alterações da Ficha Direta
        const btnFichaSalvar = document.getElementById('btn-ficha-salvar-dados');
        if (btnFichaSalvar) {
            btnFichaSalvar.onclick = async () => {
                const oldText = btnFichaSalvar.innerHTML;
                btnFichaSalvar.innerHTML = 'Salvando...'
                btnFichaSalvar.style.opacity = '0.5';

                try {
                    const rawVal = document.getElementById('ficha-ipt-valor').value;
                    let cleanVal = rawVal;
                    if (rawVal && rawVal.includes(',')) {
                        cleanVal = rawVal.replace(/\./g, "").replace(",", ".");
                    }

                    const updatePayload = {
                        telefone: document.getElementById('ficha-ipt-telefone').value.replace(/\D/g, '').substring(0, 11),
                        email: document.getElementById('ficha-ipt-email').value,
                        cpf: document.getElementById('ficha-ipt-cpf').value,
                        data_nascimento: document.getElementById('ficha-ipt-nasc').value,
                        endereco: document.getElementById('ficha-ipt-endereco').value,
                        contato_emergencia: document.getElementById('ficha-ipt-emergencia').value.replace(/\D/g, '').substring(0, 11),
                        plano: document.getElementById('ficha-ipt-plano').value,
                        instrutor: document.getElementById('ficha-ipt-instrutor').value,
                        valor_ciclo: cleanVal,
                        status: document.getElementById('ficha-ipt-status').value,
                        observacoes_saude: document.getElementById('ficha-ipt-saude').value
                    };

                    const fichaEvol = document.getElementById('ficha-ipt-evolucoes');
                    if (fichaEvol) localStorage.setItem(`movia_aluno_evolucoes_${c.id}`, fichaEvol.value);

                    if (supabase) {
                        const { error } = await supabase.from('alunos').update(updatePayload).eq('id', c.id);
                        if (error) throw error;
                    }

                    // Mutação otimista no cliente (DB_ALUNOS array master)
                    Object.assign(c, updatePayload);

                    // Atualiza a grid via fetch (re-load silencioso) se loadClientes existir
                    if (typeof loadClientes === 'function') {
                        loadClientes();
                    }

                    // Mostra feedback de sucesso
                    const fb = document.getElementById('ficha-feedback-save');
                    if (fb) {
                        fb.style.display = 'flex';
                        setTimeout(() => { fb.style.display = 'none'; }, 3000);
                    }

                    // Update header in real time (best effort)
                    const elNome = document.getElementById('ficha-aluno-nome');
                    if (elNome) elNome.innerText = document.getElementById('ficha-ipt-email').value.split('@')[0] || c.nome;
                    const elTelLocal = document.getElementById('ficha-aluno-telefone');
                    if (elTelLocal) elTelLocal.innerText = document.getElementById('ficha-ipt-telefone').value;

                } catch (e) {
                    alert("Erro ao salvar no banco: " + e.message);
                } finally {
                    btnFichaSalvar.innerHTML = oldText;
                    btnFichaSalvar.style.opacity = '1';
                }
            };
        }

        // Clock header dinamico
        const clockData = document.getElementById('ficha-aluno-header-date');
        if (clockData) {
            const d = new Date();
            const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            clockData.innerText = `${dias[d.getDay()]}, ${dateStr} - ${timeStr}`;
        }
    };

    // Close logic for new profile slide 
    document.querySelectorAll('.close-slide-perfil').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const over = e.target.closest('.slide-over-overlay');
            if (over) {
                over.classList.remove('open');
                setTimeout(() => over.classList.add('hidden-overlay'), 300);
            }
        });
    });

    // --- Persistência de Dados (Supabase) ---
    const renderClienteRow = (c) => {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return null;

        const emptyState = document.getElementById('empty-state-alunos');
        if (emptyState) emptyState.remove();

        const tr = document.createElement('tr');
        tr.className = 'crm-row';
        tr.style.cssText = 'border-bottom: 1px solid var(--border-soft); cursor: pointer; animation: fadeIn 0.4s ease-out;';

        const nomeParam = encodeURIComponent(c.nome || 'Sem Nome');
        const cStr = encodeURIComponent(JSON.stringify(c));

        tr.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-icon')) {
                window.verPerfilCompleto(cStr);
            }
        });

        const savedPic = localStorage.getItem(`movia_aluno_avatar_${c.id}`);
        const savedMat = localStorage.getItem(`movia_aluno_matricula_${c.id}`) || c.id || '--';
        const avatarSrc = savedPic ? savedPic : `https://ui-avatars.com/api/?name=${nomeParam}&background=10B981&color=fff&size=40`;

        let ageStr = '--';
        if (c.data_nascimento) {
            if (c.data_nascimento.includes('-')) {
                const parts = c.data_nascimento.split('-');
                if (parts[0].length === 4) {
                    ageStr = (new Date().getFullYear() - parseInt(parts[0])) + ' anos';
                }
            } else if (c.data_nascimento.length >= 8) {
                const yr = c.data_nascimento.substring(4);
                ageStr = (new Date().getFullYear() - parseInt(yr)) + ' anos';
            }
        }

        tr.innerHTML = `
            <td style="padding: 1rem 2rem;">
                <div style="display:flex; align-items:center; gap: 14px;">
                    <img src="${avatarSrc}" style="width:40px; height:40px; border-radius:12px; object-fit:cover;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--dark);">${c.nome || 'Sem Nome'}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); display:flex; align-items:center; gap:6px;">
                            <span style="background: ${c.status === 'Inativo' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}; color: ${c.status === 'Inativo' ? 'var(--danger)' : 'var(--success)'}; padding: 2px 8px; border-radius: 99px; font-weight:700;">${c.status || 'Ativo'}</span>
                            <span style="color:var(--text-lighter); font-weight:600;"><i data-lucide="hash" style="width:10px; display:inline-block; vertical-align:middle;"></i> Matrícula: ${savedMat}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight:500;">
                            Idade: <span style="color:var(--dark); font-weight:600;">${ageStr}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td style="padding: 1rem 1.5rem;">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="font-size: 0.8rem; color: var(--dark); display:flex; align-items:center; gap:6px;"><i data-lucide="phone" style="width:12px; color:var(--text-muted);"></i> ${formatPhoneBR(c.telefone) || 'Sem telefone'}</div>
                    <div style="font-size: 0.8rem; color: var(--dark); display:flex; align-items:center; gap:6px;"><i data-lucide="mail" style="width:12px; color:var(--text-muted);"></i> <span style="text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:120px;">${c.email || 'Sem e-mail'}</span></div>
                    ${c.cpf ? `<div style="font-size: 0.75rem; color: var(--text-muted); display:flex; align-items:center; gap:6px; margin-top:2px;"><i data-lucide="file-text" style="width:12px;"></i> ${c.cpf}</div>` : ''}
                </div>
            </td>
            <td style="padding: 1rem 1.5rem;">
                <div style="font-size:0.9rem; font-weight:600; color:var(--dark);">${c.plano || 'Customizado'}</div>
                ${c.instrutor ? `<div style="font-size: 0.75rem; color: var(--primary); margin-top:4px; font-weight:500;">Prof: ${c.instrutor}</div>` : ''}
            </td>
            <td style="padding: 1rem 1.5rem;">
                <div style="font-size:0.9rem; color:var(--dark); font-weight:600;">R$ ${c.valor_ciclo || '0,00'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:2px;">Vence ${formatDataBR(c.dia_vencimento) || '--'} (${c.modalidade_pagamento || 'Mensal'})</div>
            </td>
            <td style="padding: 1rem 2rem; text-align:right;">
                <div style="display:flex; gap:6px; justify-content:flex-end;">
                    <button class="btn-icon" style="background:#EFF6FF; border:1px solid #BFDBFE; padding:6px;" title="Editar" onclick="event.stopPropagation(); window.editarCliente('${cStr}');"><i data-lucide="pencil" style="width: 15px; color:#2563EB;"></i></button>
                    <button class="btn-icon" style="background:#FEF2F2; border:1px solid #FECACA; padding:6px;" title="Excluir" onclick="event.stopPropagation(); window.deletarCliente('${c.id}', this.closest('tr'));"><i data-lucide="trash-2" style="width: 15px; color:#DC2626;"></i></button>
                </div>
            </td>
        `;

        tbody.insertBefore(tr, tbody.firstChild);
        return tr;
    };

    const loadClientes = async () => {
        if (!supabase) return;
        try {
            const tbody = document.querySelector('table tbody');

            const { data: clientes, error } = await supabase.from('alunos').select('*').order('created_at', { ascending: true });

            if (error) throw error;

            if (clientes && clientes.length > 0) {
                if (tbody) tbody.innerHTML = '';

                clientes.forEach(c => {
                    renderClienteRow(c);
                });

                // Update KPIs
                const lblAlunos = document.getElementById('kpi-alunos');
                if (lblAlunos) lblAlunos.innerText = clientes.length;
                window.lastAlunosCount = clientes.length;

                if (window.growthChartInstance) {
                    let counts = [0, 0, 0, 0, 0, 0];
                    const today = new Date();
                    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    let labels = [];
                    for (let i = 5; i >= 0; i--) {
                        let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        labels.push(monthsNames[d.getMonth()]);
                    }
                    window.growthChartInstance.data.labels = labels;

                    clientes.forEach(c => {
                        const d = new Date(c.created_at || new Date());
                        const monthDiff = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
                        if (monthDiff >= 0 && monthDiff < 6) {
                            counts[5 - monthDiff]++;
                        }
                    });

                    window.growthChartInstance.data.datasets[0].data = counts;
                    window.growthChartInstance.update();
                }

                // Popula a Lojinha (Datalist Auto-completar)
                const dlLojinha = document.getElementById('lista-alunos-lojinha');
                if (dlLojinha) {
                    dlLojinha.innerHTML = '';
                    clientes.forEach(c => {
                        if (c.nome) {
                            const opt = document.createElement('option');
                            opt.value = c.nome;
                            dlLojinha.appendChild(opt);
                        }
                    });
                }

                // Popula Dropdown de Alunos nas Reposições
                const dlRepoAluno = document.getElementById('ipt-repo-aluno');
                if (dlRepoAluno) {
                    dlRepoAluno.innerHTML = '<option value="">Selecione um aluno...</option>';
                    clientes.forEach(c => {
                        if (c.nome) {
                            const opt = document.createElement('option');
                            opt.value = c.nome;
                            opt.innerText = c.nome;
                            dlRepoAluno.appendChild(opt);
                        }
                    });
                }

                lucide.createIcons();
            }
        } catch (err) {
            console.warn("Dica de Banco: Tabela alunos não acessível ainda.", err);
        }
    };

    // Iniciar carregamento imediatamente
    loadClientes();
    // 2. SPA Sidebar Navigation Logic
    const navItems = document.querySelectorAll('.sidebar-fixed .nav-item[data-target], .sidebar-slim .nav-item[data-target]');
    const views = document.querySelectorAll('.views-wrapper .view');
    const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');
    const dropdownMenu = document.querySelector('.nav-dropdown-menu');
    const dropdownChevron = document.querySelector('.dropdown-chevron');
    const dropdownSubItems = document.querySelectorAll('.nav-dropdown-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.dataset.target;

            navItems.forEach(nav => nav.classList.remove('active'));
            if (dropdownTrigger) dropdownTrigger.classList.remove('active');
            dropdownSubItems.forEach(sub => sub.classList.remove('active'));
            views.forEach(view => view.classList.add('hidden'));

            item.classList.add('active');
            localStorage.setItem('movia_last_tab', targetId);
            const targetView = document.getElementById('view-' + targetId);
            if (targetView) targetView.classList.remove('hidden');

            const breadcrumbCurrent = document.querySelector('.breadcrumb span');
            if (breadcrumbCurrent) {
                const labelElement = item.querySelector('.nav-label');
                if (labelElement) {
                    breadcrumbCurrent.innerText = labelElement.innerText;
                }
            }

            if (targetId === 'agenda' && typeof window.renderCalendar === 'function') {
                const subAgenda = document.getElementById('btn-sub-agenda');
                if (subAgenda && subAgenda.classList.contains('active')) {
                    window.renderCalendar();
                } else if (typeof window.renderReposicoes === 'function') {
                    window.renderReposicoes();
                }
            }
        });
    });

    if (dropdownTrigger && dropdownMenu && dropdownChevron) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (dropdownMenu.classList.contains('collapsed')) {
                dropdownMenu.classList.remove('collapsed');
                dropdownMenu.classList.add('expanded');
                dropdownChevron.classList.add('rotated');
            } else {
                dropdownMenu.classList.remove('expanded');
                dropdownMenu.classList.add('collapsed');
                dropdownChevron.classList.remove('rotated');
            }
        });
    }

    dropdownSubItems.forEach(subItem => {
        subItem.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = subItem.dataset.target;

            navItems.forEach(nav => nav.classList.remove('active'));
            dropdownSubItems.forEach(sub => sub.classList.remove('active'));
            views.forEach(view => view.classList.add('hidden'));

            subItem.classList.add('active');
            if (dropdownTrigger) dropdownTrigger.classList.add('active');

            const targetView = document.getElementById('view-' + targetId);
            if (targetView) targetView.classList.remove('hidden');

            const breadcrumbCurrent = document.querySelector('.breadcrumb span');
            if (breadcrumbCurrent) {
                let text = '';
                if (targetId === 'integracao-wellhub') text = 'Integração Wellhub';
                if (targetId === 'integracao-totalpass') text = 'Integração TotalPass';
                if (targetId === 'integracao-instagram') text = 'Integração Instagram';
                breadcrumbCurrent.innerText = text;
            }
        });
    });
    const savedTab = localStorage.getItem('movia_last_tab');
    if (savedTab) {
        const savedItem = document.querySelector(`.sidebar-fixed .nav-item[data-target="${savedTab}"]`) || document.querySelector(`.sidebar-slim .nav-item[data-target="${savedTab}"]`);
        if (savedItem) setTimeout(() => savedItem.click(), 50);
    }

    // 3. Slide-over Modal Logic
    const novoBtn = document.getElementById('btn-novo');
    const slideOver = document.getElementById('slide-over-novo');
    const closeBtns = document.querySelectorAll('.close-slide');

    if (novoBtn && slideOver) {
        slideOver.classList.add('hidden-overlay');
        slideOver.classList.remove('hidden');

        novoBtn.addEventListener('click', () => {
            const title = slideOver.querySelector('h2');
            if (title) title.innerText = 'Novo Cadastro';

            const btnSalvar = document.getElementById('btn-registar-aluno');
            if (btnSalvar) delete btnSalvar.dataset.editId;

            ['ipt-nome', 'ipt-telefone', 'ipt-email', 'ipt-valor', 'ipt-inicio', 'ipt-nascimento', 'ipt-cpf', 'ipt-endereco', 'ipt-emergencia', 'ipt-vencimento', 'ipt-instrutor', 'ipt-saude'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const opt = document.getElementById('ipt-modalidade');
            if (opt) opt.value = '';

            slideOver.classList.remove('hidden-overlay');
            setTimeout(() => { slideOver.classList.add('open'); }, 10);
        });
    }

    const closeSlide = () => {
        slideOver.classList.remove('open');
        setTimeout(() => { slideOver.classList.add('hidden-overlay'); }, 400);
    };

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeSlide);
    });

    // 4. (Removido: Lógica de abas internas do slide-over agora usa scroll contínuo)

    // 5. Engine de Cadastro (Registrar Cliente)
    const btnRegistrar = document.getElementById('btn-registar-aluno');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', async () => {
            // Coletar todos os dados
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

            let vlrRaw = getVal('ipt-valor');
            let valorFloat = vlrRaw ? parseFloat(vlrRaw.replace(/\./g, '').replace(',', '.')) : null;

            const payload = {
                nome: getVal('ipt-nome') || 'Novo Cliente',
                telefone: getVal('ipt-telefone'),
                plano: getVal('ipt-modalidade') || '',
                data_nascimento: getVal('ipt-nascimento'),
                cpf: getVal('ipt-cpf'),
                email: getVal('ipt-email'),
                endereco: getVal('ipt-endereco'),
                contato_emergencia: getVal('ipt-emergencia'),
                data_inicio: getVal('ipt-inicio'),
                modalidade_pagamento: getVal('ipt-pagamento') || 'Mensal',
                valor_ciclo: valorFloat,
                dia_vencimento: getVal('ipt-vencimento'),
                instrutor: getVal('ipt-instrutor'),
                observacoes_saude: getVal('ipt-saude'),
                status: getVal('ipt-status') || 'Ativo'
            };

            const btnOriginalText = btnRegistrar.innerHTML;
            btnRegistrar.innerHTML = 'Salvando...';
            btnRegistrar.style.opacity = '0.7';

            let novoId = null;
            const editId = btnRegistrar.dataset.editId;

            try {
                if (supabase) {
                    if (editId) {
                        const { error } = await supabase.from('alunos').update(payload).eq('id', editId);
                        if (error) throw error;
                    } else {
                        const { data: inserts, error } = await supabase.from('alunos').insert([payload]).select();
                        if (error) throw error;
                        if (inserts && inserts.length > 0) novoId = inserts[0].id;
                    }
                }
            } catch (err) {
                alert("Erro ao salvar no banco: " + (err.message || JSON.stringify(err)));
                console.warn("Dica de Banco: Módulo Clientes falhou no banco.", err);
                return; // Stop execution on error
            }

            // Atualizar UI
            if (editId) {
                // Recarrega todos para manter a ordem correta
                await loadClientes();
            } else {
                if (novoId) payload.id = novoId;
                const newTr = renderClienteRow(payload);
                if (newTr) {
                    newTr.style.background = 'rgba(16,185,129,0.08)';
                    lucide.createIcons({ root: newTr });
                    setTimeout(() => {
                        newTr.style.background = 'transparent';
                        newTr.style.transition = 'background 0.5s ease';
                    }, 1200);

                    // Increment KPI count locally
                    const lblAlunos = document.getElementById('kpi-alunos');
                    if (lblAlunos) {
                        lblAlunos.innerText = parseInt(lblAlunos.innerText || '0') + 1;
                    }
                }
            }

            // Sucesso UX
            btnRegistrar.innerHTML = `Cadastrado!`;
            btnRegistrar.style.opacity = '1';
            btnRegistrar.style.background = 'var(--success)';
            btnRegistrar.style.borderColor = 'var(--success)';

            setTimeout(() => {
                closeSlide();
                delete btnRegistrar.dataset.editId; // Cleanup crucial
                // Limpar campos
                ['ipt-nome', 'ipt-telefone', 'ipt-email', 'ipt-valor', 'ipt-inicio'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                btnRegistrar.innerHTML = btnOriginalText;
                btnRegistrar.style.background = 'var(--primary)';
                btnRegistrar.style.color = 'var(--white)';
            }, 1000);
        });
    }

    // 6. Init Dashboard Chart
    const ctx = document.getElementById('growthChart');
    if (ctx && window.Chart) {
        window.growthChartInstance = new Chart(ctx, {
            type: 'bar', // Foi mudado para barra!
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Novos Clientes',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#10B981', // Verde suave e animado
                    borderRadius: 4,
                    barPercentage: 0.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        padding: 12,
                        titleFont: { size: 13, family: "'Inter', sans-serif" },
                        bodyFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
                        displayColors: false,
                        callbacks: {
                            label: function (context) { return context.raw + ' alunos'; }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                        border: { display: false },
                        ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#9CA3AF', padding: 10 }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        border: { display: false },
                        ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#9CA3AF', padding: 10 }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }

    // 8. Importação Inteligente (Aba Visual + XLSX)
    const btnImportMenu = document.getElementById('btn-import-excel');
    const importSlide = document.getElementById('slide-over-import');
    const closeImportBtns = document.querySelectorAll('.close-slide-import');
    const importState1 = document.getElementById('import-state-1');
    const importState2 = document.getElementById('import-state-2');
    const btnTriggerFile = document.getElementById('btn-trigger-file');
    const uploader = document.getElementById('upload-excel');
    const btnExecutarImport = document.getElementById('btn-executar-import');
    const importCountBadge = document.getElementById('import-btn-count');
    const previewTbody = document.querySelector('#import-preview-table tbody');

    let importPayloadData = [];

    if (btnImportMenu && importSlide) {
        btnImportMenu.addEventListener('click', () => {
            // Reset UI
            importState1.style.display = 'block';
            importState2.style.display = 'none';
            btnExecutarImport.style.display = 'none';
            if (uploader) uploader.value = '';
            importPayloadData = [];

            importSlide.classList.remove('hidden-overlay');
            setTimeout(() => importSlide.classList.add('open'), 10);
        });
    }

    closeImportBtns.forEach(b => b.addEventListener('click', () => {
        importSlide.classList.remove('open');
        setTimeout(() => importSlide.classList.add('hidden-overlay'), 300);
    }));

    if (btnTriggerFile && uploader) {
        btnTriggerFile.addEventListener('click', () => {
            uploader.click();
        });

        uploader.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const oldHtml = btnTriggerFile.innerHTML;
            btnTriggerFile.innerHTML = `Processando...`;
            btnTriggerFile.style.pointerEvents = 'none';

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    importPayloadData = [];
                    previewTbody.innerHTML = '';

                    for (let i = 0; i < rows.length; i++) {
                        const cols = rows[i];
                        if (!cols || cols.length === 0) continue;

                        const str0 = String(cols[0] || '').trim();
                        if (!str0 || str0.toLowerCase().includes('nome') || str0.toLowerCase().includes('cliente')) continue;

                        let parsedNome = str0;
                        let parsedPhone = '';

                        if (cols.length > 1) {
                            for (let j = 1; j < cols.length; j++) {
                                let cand = String(cols[j] || '').trim();
                                if (cand.replace(/\D/g, '').length >= 8 && !cand.includes('@')) {
                                    parsedPhone = cand;
                                    break;
                                }
                            }
                            if (!parsedPhone) parsedPhone = String(cols[1] || '').trim();
                        }

                        const payload = {
                            nome: parsedNome,
                            telefone: parsedPhone.replace(/\D/g, '').substring(0, 11),
                            status: 'Ativo',
                            plano: 'Importado',
                            modalidade_pagamento: 'Mensal'
                        };
                        importPayloadData.push(payload);

                        // Renderiza no preview
                        const tr = document.createElement('tr');
                        tr.style.cssText = 'border-bottom:1px solid var(--border-soft);';
                        tr.innerHTML = `
                           <td style="padding:0.75rem 1rem; font-size:0.8rem; font-weight:600; color:var(--dark);">${parsedNome}</td>
                           <td style="padding:0.75rem 1rem; font-size:0.8rem; color:var(--text-muted);">${formatPhoneBR(payload.telefone) || '---'}</td>
                           <td style="padding:0.75rem 1rem;"><span style="background:rgba(16,185,129,0.1); color:var(--success); padding:2px 8px; border-radius:99px; font-size:0.7rem; font-weight:700;">Pronto</span></td>
                        `;
                        previewTbody.appendChild(tr);
                    }

                    if (importPayloadData.length > 0) {
                        importState1.style.display = 'none';
                        importState2.style.display = 'block';
                        btnExecutarImport.style.display = 'flex';
                        importCountBadge.textContent = importPayloadData.length;
                    } else {
                        alert("Nenhum cliente válido localizado na planilha.");
                    }

                } catch (err) {
                    alert('Erro ao processar arquivo: ' + err.message);
                    console.error(err);
                } finally {
                    btnTriggerFile.innerHTML = oldHtml;
                    btnTriggerFile.style.pointerEvents = 'auto';
                    uploader.value = '';
                    if (window.lucide) window.lucide.createIcons();
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if (btnExecutarImport) {
        btnExecutarImport.addEventListener('click', async () => {
            if (!importPayloadData.length) return;

            const originalContent = btnExecutarImport.innerHTML;
            btnExecutarImport.innerHTML = 'Salvando Lote...';
            btnExecutarImport.style.opacity = '0.5';
            btnExecutarImport.style.pointerEvents = 'none';

            try {
                if (supabase) {
                    const { error } = await supabase.from('alunos').insert(importPayloadData);
                    if (error) throw error;

                    importSlide.classList.remove('open');
                    setTimeout(() => importSlide.classList.add('hidden-overlay'), 300);

                    alert(`Sucesso! ${importPayloadData.length} clientes carregados para a base!`);
                    await loadClientes();
                }
            } catch (e) {
                alert("Erro ao importar lote: " + e.message);
                console.error(e);
            } finally {
                btnExecutarImport.innerHTML = originalContent;
                btnExecutarImport.style.opacity = '1';
                btnExecutarImport.style.pointerEvents = 'auto';
            }
        });
    }

    // 9. Módulo Financeiro
    const btnNovaDespesa = document.getElementById('btn-nova-despesa');
    const btnNovaReceita = document.getElementById('btn-nova-receita');
    const slideFinanceiro = document.getElementById('slide-over-financeiro');
    const closeFinBtns = document.querySelectorAll('.close-slide-fin');
    const iptFinTipo = document.getElementById('ipt-fin-tipo');
    const finModalTitle = document.getElementById('fin-modal-title');
    const selectFinCat = document.getElementById('ipt-fin-cat');
    const btnSalvarFin = document.getElementById('btn-salvar-fin');
    const iptFinValor = document.getElementById('ipt-fin-valor');

    // Máscara de Moeda (Real time formatter)
    iptFinValor.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ""); // remove none digits
        if (value === "") {
            e.target.value = "";
            return;
        }
        value = parseInt(value, 10);
        let formatted = (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        e.target.value = formatted;
    });

    const formatMoney = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    window.openFinSlide = (tipo) => {
        iptFinTipo.value = tipo;
        finModalTitle.innerHTML = tipo === 'receita' ? '<i data-lucide="arrow-up-circle" style="color:#10B981; width:20px; display:inline-block; vertical-align:middle; margin-right:6px;"></i> Nova Entrada' : '<i data-lucide="arrow-down-circle" style="color:#EF4444; width:20px; display:inline-block; vertical-align:middle; margin-right:6px;"></i> Nova Saída';

        selectFinCat.innerHTML = tipo === 'receita'
            ? `<option value="Mensalidade">Mensalidade</option><option value="Avulso">Plano Avulso / Produto</option><option value="Outros">Outros</option>`
            : `<option value="Aluguel">Aluguel / Condomínio</option><option value="Impostos">Impostos / Taxas</option><option value="Operacional">Custo Operacional</option><option value="Salarios">Salários / Terceiros</option><option value="Equipamentos">Equipamentos</option><option value="AguaLuz">Água / Luz / Internet</option><option value="Outros">Outros</option>`;

        const lblPessoa = document.getElementById('lbl-fin-pessoa');
        const iptPessoa = document.getElementById('ipt-fin-pessoa');
        if (lblPessoa && iptPessoa) {
            lblPessoa.innerText = tipo === 'receita' ? 'Origem da Entrada (De onde veio)' : 'Destino da Saída (Para quem foi)';
            iptPessoa.placeholder = tipo === 'receita' ? 'Ex: Rômulo, Maria, Aluno...' : 'Ex: CPFL, Imobiliária, Loja...';
        }


        document.getElementById('ipt-fin-valor').value = '';
        document.getElementById('ipt-fin-desc').value = '';
        document.getElementById('ipt-fin-pessoa').value = '';
        document.getElementById('ipt-fin-data').value = new Date().toISOString().split('T')[0];
        document.getElementById('ipt-fin-status').value = 'Pago';
        document.getElementById('ipt-fin-forma').value = 'PIX';

        // Reset the segmented control visually
        document.querySelectorAll('.status-btn').forEach(b => {
            b.style.background = 'transparent';
            b.style.boxShadow = 'none';
            b.style.color = '#6B7280';
            b.style.fontWeight = '600';
        });
        const bPago = document.querySelector('.status-btn[data-val="Pago"]');
        if (bPago) {
            bPago.style.background = 'white';
            bPago.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            bPago.style.color = '#10B981';
            bPago.style.fontWeight = '700';
        }

        slideFinanceiro.classList.remove('hidden-overlay');
        setTimeout(() => slideFinanceiro.classList.add('open'), 10);
        if (window.lucide) window.lucide.createIcons();
    };

    if (btnNovaReceita) btnNovaReceita.addEventListener('click', () => openFinSlide('receita'));
    if (btnNovaDespesa) btnNovaDespesa.addEventListener('click', () => openFinSlide('despesa'));

    // Componente de Segmented Control para Status (Pago / Não Pago)
    const statusBtns = document.querySelectorAll('.status-btn');
    const iptFinStatus = document.getElementById('ipt-fin-status');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            statusBtns.forEach(b => {
                b.style.background = 'transparent';
                b.style.boxShadow = 'none';
                b.style.color = '#6B7280';
                b.style.fontWeight = '600';
            });
            const tgt = e.currentTarget;
            tgt.style.background = 'white';
            tgt.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            tgt.style.fontWeight = '700';

            const val = tgt.getAttribute('data-val');
            iptFinStatus.value = val;

            if (val === 'Pago') {
                tgt.style.color = '#10B981';
            } else {
                tgt.style.color = '#EF4444';
            }
        });
    });

    closeFinBtns.forEach(b => b.addEventListener('click', () => {
        slideFinanceiro.classList.remove('open');
        setTimeout(() => slideFinanceiro.classList.add('hidden-overlay'), 300);
    }));

    window.loadFinanceiro = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('financeiro')
                .select('*')
                .order('data_lancamento', { ascending: false });

            if (error) {
                if (error.message.includes("relation") || error.code === '42P01') {
                    console.warn("Tabela financeiro precisa ser criada no Supabase");
                    document.getElementById('empty-state-financeiro').style.display = 'table-row';
                    document.getElementById('empty-state-financeiro').innerHTML = `<td colspan="6" style="padding: 4rem 2rem; text-align: center; color: var(--text-muted);"><div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 8px;"><i data-lucide="database" style="width:48px; height:48px; opacity:0.15; color:var(--dark);"></i><h3 style="color:var(--dark); font-weight:600; margin-top:8px;">Aviso Técnico (Supabase)</h3><p style="font-size:0.85rem;">Necessário rodar as migrations SQL para habilitar a tabela "financeiro". Crie a tabela na cloud.</p></div></td>`;
                    if (window.lucide) window.lucide.createIcons();
                    return;
                }
                throw error;
            }

            const tbody = document.querySelector('#table-financeiro tbody');
            document.querySelectorAll('.fin-row, .empty-fin-msg').forEach(el => el.remove());

            if (!data || data.length === 0) {
                document.getElementById('empty-state-financeiro').style.display = 'table-row';
                document.getElementById('kpi-fin-entradas').textContent = 'R$ 0,00';
                document.getElementById('kpi-fin-saidas').textContent = 'R$ 0,00';
                document.getElementById('kpi-fin-saldo').textContent = 'R$ 0,00';

                const ultimasLista = document.getElementById('list-ultimas-entradas');
                if (ultimasLista) {
                    ultimasLista.innerHTML = `<div style="padding: 3.5rem 1rem; text-align: center; color: var(--text-muted);"><i data-lucide="inbox" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.5;"></i><p style="font-size: 0.85rem;">Nenhuma movimentação registrada.</p></div>`;
                }
                const kpiPendentes = document.getElementById('kpi-pendentes');
                if (kpiPendentes) kpiPendentes.textContent = "0";

                return;
            }

            document.getElementById('empty-state-financeiro').style.display = 'none';

            let entradas = 0;
            let saidas = 0;

            data.forEach(t => {
                const tr = document.createElement('tr');
                tr.className = 'fin-row';
                tr.style.cssText = 'border-bottom:1px solid var(--border-soft);';

                const val = parseFloat(t.valor || 0);

                // Contabilidade para Atualizar KPIs Superiores (do Módulo Financeiro e do Painel Geral)
                if (t.tipo === 'receita' && t.status !== 'Não Pago') entradas += val;
                if (t.tipo === 'despesa') saidas += val;

                const tipoBadge = t.tipo === 'receita'
                    ? `<span style="background:rgba(16,185,129,0.1); color:#10B981; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700;"><i data-lucide="arrow-up" style="width:10px; display:inline; margin-right:2px;"></i> Entrada</span>`
                    : `<span style="background:rgba(239,68,68,0.1); color:#EF4444; padding:2px 8px; border-radius:99px; font-size:0.65rem; font-weight:700;"><i data-lucide="arrow-down" style="width:10px; display:inline; margin-right:2px;"></i> Saída</span>`;

                const statusBadge = t.status === 'Não Pago'
                    ? `<span style="background:#FEF2F2; color:#EF4444; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700; border:1px solid #FCA5A5;">Não Pago</span>`
                    : `<span style="color:#10B981; font-size:0.75rem; font-weight:600;"><i data-lucide="check-circle-2" style="width:12px; display:inline-block; vertical-align:middle;"></i> Pago</span>`;

                const pessoaStr = t.pessoa ? `<div style="font-size:0.75rem; color:var(--text-lighter); margin-top:4px;"><i data-lucide="user" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${t.pessoa}</div>` : '';
                const formaStr = t.forma_pagamento ? `<div style="font-size:0.75rem; color:var(--text-lighter); margin-top:4px;"><i data-lucide="credit-card" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${t.forma_pagamento}</div>` : '';

                tr.innerHTML = `
                    <td style="padding:1rem 2rem; font-size:0.8rem; font-weight:600; color:var(--text-muted);">${formatDataBR(t.data_lancamento)}</td>
                    <td style="padding:1rem 1.5rem; font-size:0.85rem; font-weight:600; color:var(--dark);">
                        ${t.descricao}
                        ${pessoaStr}
                    </td>
                    <td style="padding:1rem 1.5rem;">
                        <span style="color:var(--text-muted); font-size:0.8rem; background:#F1F5F9; padding:4px 8px; border-radius:6px;">${t.categoria || '-'}</span>
                        ${formaStr}
                    </td>
                    <td style="padding:1rem 1.5rem; font-size:0.95rem; font-weight:700; color:${t.tipo === 'receita' ? '#10B981' : '#EF4444'};">${formatMoney(t.valor)}</td>
                    <td style="padding:1rem 1.5rem; display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                        ${tipoBadge}
                        ${statusBadge}
                    </td>
                    <td style="padding:1rem 2rem; text-align:right;">
                        <button class="btn-icon" onclick="deletarTransacao(${t.id}, this)" title="Remover Movimentação"><i data-lucide="trash-2" style="width:14px; opacity:0.5;"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('kpi-fin-entradas').textContent = formatMoney(entradas);
            document.getElementById('kpi-fin-saidas').textContent = formatMoney(saidas);
            document.getElementById('kpi-fin-saldo').textContent = formatMoney(entradas - saidas);

            // --- Atualizar Dashboard Global ---
            const kpiReceita = document.getElementById('kpi-receita');
            if (kpiReceita) kpiReceita.textContent = formatMoney(entradas);

            const kpiSaidasGlobal = document.getElementById('kpi-saidas');
            if (kpiSaidasGlobal) kpiSaidasGlobal.textContent = formatMoney(saidas);

            const pendentesCount = data.filter(r => r.status === 'Não Pago').length;
            const kpiPendentes = document.getElementById('kpi-pendentes');
            if (kpiPendentes) kpiPendentes.textContent = pendentesCount.toString();

            const ultimasLista = document.getElementById('list-ultimas-entradas');
            if (ultimasLista) {
                ultimasLista.innerHTML = '';
                const ultimos5 = data.slice(0, 4); // Mostra os top 4
                ultimos5.forEach(tx => {
                    const isReceita = tx.tipo === 'receita';
                    // We don't have window.lucide access explicitly here so we rely on createIcons after innerHTML
                    const iconeType = isReceita ? '<i data-lucide="arrow-up-right" style="width:16px; color:#10B981;"></i>' : '<i data-lucide="arrow-down-left" style="width:16px; color:#EF4444;"></i>';
                    const corValor = isReceita ? 'var(--success)' : 'var(--text-primary)';
                    const prefix = isReceita ? '+' : '-';
                    const situacaoBadge = tx.status === 'Não Pago' ? `<span style="font-size:0.65rem; color:#EF4444; background:#FEF2F2; padding:1px 4px; border-radius:4px; margin-left:6px; font-weight:600;">Não Pago</span>` : '';

                    ultimasLista.innerHTML += `
                    <div style="display:flex; justify-content:space-between; padding: 1rem 0; border-bottom:1px solid var(--border-soft);">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <div style="width:36px; height:36px; background:#F3F4F6; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                                ${iconeType}
                            </div>
                            <div>
                                <div style="font-weight:600; font-size:0.85rem; color:var(--dark); display:flex; align-items:center;">
                                    ${tx.descricao} ${situacaoBadge}
                                </div>
                                <div style="font-size:0.75rem; color:var(--text-muted);">
                                    ${formatDataBR(tx.data_lancamento)}
                                </div>
                            </div>
                        </div>
                        <div style="font-weight:700; font-size:0.9rem; color:${corValor};">
                            ${prefix} ${formatMoney(tx.valor || 0)}
                        </div>
                    </div>`;
                });
            }

            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            console.error("Erro Financeiro:", err);
        }
    };

    window.deletarTransacao = async (id, el) => {
        if (!confirm('Deseja cancelar esta transação permanentemente?')) return;
        el.style.opacity = '0.3';
        el.style.pointerEvents = 'none';

        try {
            const { error } = await supabase.from('financeiro').delete().eq('id', id);
            if (error) throw error;
            await loadFinanceiro();
        } catch (e) {
            alert("Erro ao excluir transação no servidor.");
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        }
    }


    if (btnSalvarFin) {
        btnSalvarFin.addEventListener('click', async () => {
            let valorRaw = document.getElementById('ipt-fin-valor').value;
            let valorFloat = 0;
            if (valorRaw) {
                valorFloat = parseFloat(valorRaw.replace(/\./g, '').replace(',', '.'));
            }

            if (!valorFloat || valorFloat <= 0) {
                alert('Preencha um valor válido!');
                return;
            }

            const payload = {
                tipo: iptFinTipo.value,
                valor: valorFloat,
                descricao: document.getElementById('ipt-fin-desc').value || 'Sem descrição',
                data_lancamento: document.getElementById('ipt-fin-data').value || new Date().toISOString().split('T')[0],
                categoria: document.getElementById('ipt-fin-cat').value,
                pessoa: document.getElementById('ipt-fin-pessoa').value || null,
                status: document.getElementById('ipt-fin-status').value,
                forma_pagamento: document.getElementById('ipt-fin-forma').value
            };

            const originalBtn = btnSalvarFin.innerHTML;
            btnSalvarFin.innerHTML = 'Salvando...';
            btnSalvarFin.style.pointerEvents = 'none';
            btnSalvarFin.style.opacity = '0.6';

            try {
                if (supabase) {
                    const { error } = await supabase.from('financeiro').insert([payload]);
                    if (error) throw error;

                    slideFinanceiro.classList.remove('open');
                    setTimeout(() => slideFinanceiro.classList.add('hidden-overlay'), 300);
                    await loadFinanceiro();
                }
            } catch (err) {
                alert("Falha de Banco (Supabase): Você precisa criar a tabela `financeiro` no banco de projetos Supabase. Erro: " + err.message);
            } finally {
                btnSalvarFin.innerHTML = originalBtn;
                btnSalvarFin.style.pointerEvents = 'auto';
                btnSalvarFin.style.opacity = '1';
            }
        });
    }

    // Nav-icons integration to run loads
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target === 'financeiro') loadFinanceiro();
        });
    });

    // Iniciar dados financeiros p/ o Dashboard de Início
    if (typeof window.loadFinanceiro === 'function') {
        window.loadFinanceiro();
    }

    // --- Lógica do Módulo Agenda (Calendário) ---
    window.currentAgendaMode = 'week'; // Força Excel-like view by default
    window.currentAgendaFilterSearch = '';
    window.currentAgendaFilterService = 'todos';
    let currentCalDate = new Date();
    const slideAgenda = document.getElementById('slide-over-agenda'); // Mantenha no dom pra erro n aparecer

    // Funções de formatação de data ISO local "YYYY-MM-DD"
    const getLocalISO = (d) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // Toggle dos Modos de Visualização
    document.querySelectorAll('.mode-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-view-btn').forEach(b => {
                b.classList.remove('active');
                if (b.dataset.mode === 'week') b.style.color = '#4B5563';
                b.style.background = b.dataset.mode === 'aniversariantes' ? '#FFF7ED' : '#F9FAFB';
                b.style.color = b.dataset.mode === 'aniversariantes' ? '#EA580C' : '#4B5563';
            });
            const tgt = e.currentTarget;
            tgt.classList.add('active');
            if (tgt.dataset.mode === 'aniversariantes') {
                tgt.style.background = '#FFF7ED';
                tgt.style.color = '#EA580C';
                tgt.style.fontWeight = '700';
            } else {
                tgt.style.background = '#E0F2FE';
                tgt.style.color = '#0284C7';
            }
            window.currentAgendaMode = tgt.dataset.mode;
            window.renderCalendar();
        });
    });

    window.renderCalendar = async () => {
        const viewArea = document.getElementById('calendar-view-area');
        const monthTitle = document.getElementById('cal-month-title');
        if (!viewArea || !monthTitle) return;

        viewArea.innerHTML = '';

        let todasAnotacoes = [];
        try { todasAnotacoes = JSON.parse(localStorage.getItem('movia_agenda') || '[]'); } catch (e) { }

        if (supabase) {
            try {
                const { data } = await supabase.from('agenda').select('*');
                if (data && data.length > 0) {
                    data.forEach(remota => {
                        let parsedCor = '#06b6d4';
                        let parsedObs = '';
                        let parsedProf = 'Geral / Principal';

                        if (remota.texto && remota.texto.trim().startsWith('{')) {
                            try {
                                const parsed = JSON.parse(remota.texto);
                                cleanText = parsed.texto || '';
                                horaVal = parsed.hora_inicio || '';
                                servicoVal = parsed.servico || '';
                                parsedCor = parsed.cor || parsedCor;
                                parsedObs = parsed.observacao || '';
                                parsedProf = parsed.profissional || parsedProf;
                            } catch (e) { }
                        }

                        const existeIndex = todasAnotacoes.findIndex(loc =>
                            loc.id == remota.id ||
                            (loc.data_evento === remota.data_evento && loc.texto === cleanText && loc.hora_inicio === horaVal)
                        );
                        if (existeIndex === -1) {
                            todasAnotacoes.push({
                                id: remota.id,
                                data_evento: remota.data_evento,
                                texto: cleanText,
                                hora_inicio: horaVal,
                                servico: servicoVal,
                                cor: parsedCor,
                                observacao: parsedObs,
                                profissional: parsedProf,
                                localId: 'local_' + remota.id
                            });
                        } else {
                            if (!todasAnotacoes[existeIndex].id) {
                                todasAnotacoes[existeIndex].id = remota.id;
                            }
                            todasAnotacoes[existeIndex].hora_inicio = todasAnotacoes[existeIndex].hora_inicio || horaVal;
                            todasAnotacoes[existeIndex].servico = todasAnotacoes[existeIndex].servico || servicoVal;
                        }
                    });
                }
            } catch (e) { }
        }

        // Injeção de Aniversários como Eventos e Confetes
        try {
            let lsAlunos = [];
            try { lsAlunos = JSON.parse(localStorage.getItem('movia_alunos') || '[]'); } catch (e) { }
            const todayISO = getLocalISO(new Date());
            lsAlunos.forEach(al => {
                if (al.data_nascimento && al.data_nascimento.length >= 5) {
                    let bMonth, bDay;
                    if (al.data_nascimento.includes('-')) {
                        const p = al.data_nascimento.split('-');
                        if (p.length === 3) { bMonth = p[1]; bDay = p[2]; }
                    } else if (al.data_nascimento.includes('/')) {
                        const p = al.data_nascimento.split('/');
                        if (p.length === 3) { bDay = p[0]; bMonth = p[1]; }
                    } else if (al.data_nascimento.length === 8) {
                        bDay = al.data_nascimento.substring(0, 2);
                        bMonth = al.data_nascimento.substring(2, 4);
                    }
                    if (bMonth && bDay) {
                        const evtDate = `${currentCalDate.getFullYear()}-${bMonth}-${bDay}`;
                        todasAnotacoes.push({
                            id: 'bday_' + al.nome,
                            localId: 'bday_' + al.nome,
                            data_evento: evtDate,
                            texto: `🎂 Aniv. ${al.nome}`,
                            hora_inicio: '08:00',
                            servico: 'Aniversariante',
                            cor: '#EA580C',
                            observacao: 'Envie uma mensagem de parabéns!',
                            profissional: '',
                            isBirthday: true
                        });
                        if (evtDate === todayISO && !window.confettiFiredToday && typeof confetti === 'function') {
                            window.confettiFiredToday = true;
                            setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }), 700);
                        }
                    }
                }
            });
        } catch (e) { console.error('Erro ao injetar aniversariantes', e); }

        // Filtros
        let filteredNotes = todasAnotacoes;
        if (currentAgendaFilterSearch) {
            filteredNotes = filteredNotes.filter(n => (n.texto || '').toLowerCase().includes(currentAgendaFilterSearch));
        }
        if (currentAgendaFilterService !== 'todos') {
            filteredNotes = filteredNotes.filter(n => n.servico === currentAgendaFilterService);
        }

        // Modos
        if (currentAgendaMode === 'month') {
            renderMonthView(viewArea, monthTitle, filteredNotes);
        } else if (currentAgendaMode === 'week') {
            renderTimelineView(viewArea, monthTitle, filteredNotes, 7);
        } else if (currentAgendaMode === 'three_days') {
            renderTimelineView(viewArea, monthTitle, filteredNotes, 3);
        } else if (currentAgendaMode === 'day') {
            renderTimelineView(viewArea, monthTitle, filteredNotes, 1);
        } else if (currentAgendaMode === 'list') {
            renderListView(viewArea, monthTitle, filteredNotes);
        } else if (currentAgendaMode === 'aniversariantes') {
            renderAniversariantesView(viewArea, monthTitle, filteredNotes);
        }

        if (window.lucide) window.lucide.createIcons();
    };

    function renderMonthView(viewArea, monthTitle, filteredNotes) {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const ptBRMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthTitle.innerHTML = `<i data-lucide="book-open" style="color:var(--primary); margin-right:8px; width:20px; display:inline-block; vertical-align:middle;"></i> ${ptBRMonths[month]} ${year}`;

        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border-soft); background:#F9FAFB; position: sticky; top:0; z-index:10;';
        const dNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dNames.forEach((n, idx) => {
            const el = document.createElement('div');
            el.style.cssText = `padding: 1rem; text-align: center; font-weight: 700; font-size: 0.75rem; color: ${idx === 0 ? '#EF4444' : 'var(--text-muted)'}; letter-spacing: 0.05em; text-transform: uppercase;`;
            el.innerText = n;
            headerRow.appendChild(el);
        });
        viewArea.appendChild(headerRow);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns: repeat(7, 1fr); flex:1; background:var(--border-soft); gap:1px; border-bottom: 1px solid var(--border-soft); min-height: 500px;';
        viewArea.appendChild(grid);

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        let firstDayOfWeek = firstDayOfMonth.getDay();
        const todayStr = getLocalISO(new Date());
        let currentDateCounter = new Date(year, month, 1 - firstDayOfWeek);

        for (let i = 0; i < 42; i++) {
            const tempDate = new Date(currentDateCounter);
            const dateStr = getLocalISO(tempDate);
            const isCurrentMonth = tempDate.getMonth() === month;
            const isToday = dateStr === todayStr;

            const cell = document.createElement('div');
            cell.style.cssText = `background: ${isCurrentMonth ? '#fff' : '#FAFAFA'}; min-height: 110px; padding: 8px; display:flex; flex-direction:column; cursor:pointer; transition:background 0.2s; position:relative; overflow:hidden;`;
            cell.onmouseover = () => { if (isCurrentMonth) cell.style.background = '#F0F9FF'; };
            cell.onmouseout = () => { cell.style.background = isCurrentMonth ? '#fff' : '#FAFAFA'; };

            const dayNum = document.createElement('div');
            dayNum.style.cssText = `font-size:0.85rem; font-weight:600; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; color: ${isCurrentMonth ? 'var(--dark)' : '#D1D5DB'};`;
            if (isToday) {
                dayNum.style.background = 'var(--primary)';
                dayNum.style.color = '#fff';
            }
            dayNum.innerText = tempDate.getDate();

            const notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container custom-scrollbar';
            notesContainer.style.cssText = 'flex:1; margin-top:8px; display:flex; flex-direction:column; gap:4px; overflow-y:auto;';

            cell.onclick = (e) => {
                if (e.target.closest('.note-bubble')) return;
                window.abrirModalNovaAula({ data_evento: dateStr });
            };

            cell.appendChild(dayNum);
            cell.appendChild(notesContainer);
            grid.appendChild(cell);

            const dayNotes = filteredNotes.filter(n => n.data_evento === dateStr);
            dayNotes.forEach(note => {
                const bbl = document.createElement('div');
                bbl.className = 'note-bubble';
                bbl.dataset.id = note.id || '';
                bbl.dataset.localId = note.localId || '';
                bbl.style.cssText = 'background: #FEF9C3; border-left:3px solid #FACC15; padding: 4px 6px; font-size: 0.68rem; color: #854D0E; font-weight: 600; border-radius: 0 4px 4px 4px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-bottom: 2px;';

                let servicoLabel = note.servico ? `[${note.servico}] ` : '';
                let horaLabel = note.hora_inicio ? `${note.hora_inicio} ` : '';
                bbl.innerText = `${horaLabel}${servicoLabel}${note.texto}`;
                bbl.title = `${horaLabel}${servicoLabel}${note.texto}`;

                bbl.onclick = (e) => {
                    e.stopPropagation();
                    window.abrirModalNovaAula(note);
                };
                notesContainer.appendChild(bbl);
            });

            currentDateCounter.setDate(currentDateCounter.getDate() + 1);
        }
    }

    function renderTimelineView(viewArea, monthTitle, filteredNotes, numDays, isReposicao = false) {
        viewArea.innerHTML = ''; // Evitar duplicação da área de visualização
        const ptBRMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const ptBRDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        let startDt = new Date(currentCalDate);
        if (numDays === 7) {
            startDt.setDate(startDt.getDate() - startDt.getDay());
        }

        const datesOfWeek = [];
        for (let i = 0; i < (numDays === 1 ? 1 : 7); i++) {
            let nextDay = new Date(startDt);
            nextDay.setDate(startDt.getDate() + i);
            datesOfWeek.push(nextDay);
        }

        const iconTitle = isReposicao ? 'clock-alert' : 'calendar';
        const titleStr = isReposicao ? 'Reposições' : 'Agenda';
        monthTitle.innerHTML = `<i data-lucide="${iconTitle}" style="color:var(--primary); margin-right:8px; width:20px; display:inline-block; vertical-align:middle;"></i> ${titleStr} (${numDays === 7 ? 'Semanal' : numDays === 1 ? 'Diária' : numDays + ' Dias'}) - ${ptBRMonths[startDt.getMonth()]} ${startDt.getFullYear()}`;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-scrollbar';
        wrapper.style.cssText = 'flex:1; width: 100%; height: 100%; overflow:auto; background:white; border-radius: 8px; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';

        const table = document.createElement('table');
        table.style.cssText = 'width: 100%; min-width: 800px; border-collapse: collapse; table-layout: fixed;';

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        const thTime = document.createElement('th');
        thTime.style.cssText = 'width: 70px; background: #F8FAFC; border: 1px solid #CBD5E1; border-top: none; border-left: none; padding: 10px 4px; position: sticky; top: 0; z-index: 10; font-size: 0.75rem; color: #475569;';
        thTime.innerText = 'Horário';
        trHead.appendChild(thTime);

        datesOfWeek.forEach(dt => {
            const th = document.createElement('th');
            const isToday = getLocalISO(dt) === getLocalISO(new Date());
            th.style.cssText = `background: #F8FAFC; border: 1px solid #CBD5E1; border-top: none; padding: 10px 6px; position: sticky; top: 0; z-index: 10; font-size: 0.8rem; color: ${isToday ? '#2563EB' : '#1E293B'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;`;
            th.innerHTML = `${ptBRDays[dt.getDay()]} <span style="font-size:1rem; margin-left:4px; font-weight:800; ${isToday ? 'color:white; background:#2563EB; border-radius:4px; padding:0 6px;' : ''}">${dt.getDate()}</span>`;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        const times = [];
        for (let h = 5; h <= 21; h++) {
            times.push(`${h.toString().padStart(2, '0')}:00`);
            times.push(`${h.toString().padStart(2, '0')}:30`);
        }

        times.forEach(time => {
            const tr = document.createElement('tr');

            const tdTime = document.createElement('td');
            const isFullHour = time.endsWith('00');
            tdTime.style.cssText = `background: #F8FAFC; border: 1px solid #CBD5E1; border-left: none; text-align: center; padding: 4px; font-weight: ${isFullHour ? '700' : '500'}; font-size: ${isFullHour ? '0.75rem' : '0.65rem'}; color: ${isFullHour ? '#475569' : '#94A3B8'};`;
            tdTime.innerText = time;
            tr.appendChild(tdTime);

            datesOfWeek.forEach(dt => {
                const dateIso = getLocalISO(dt);
                const td = document.createElement('td');
                td.style.cssText = `border: 1px solid ${isFullHour ? '#CBD5E1' : '#E2E8F0'}; cursor: pointer; padding: 3px 4px; vertical-align: top; height: 32px; transition: background 0.1s; background: white;`;

                td.onmouseover = () => td.style.background = '#F1F5F9';
                td.onmouseout = () => td.style.background = 'white';

                const cellNotes = filteredNotes.filter(n => n.data_evento === dateIso && n.hora_inicio === time);

                if (cellNotes.length > 0) {
                    cellNotes.forEach(note => {
                        const noteDiv = document.createElement('div');
                        // Usando um design extremamente compacto e elegante tipo Excel (borda lateral colorida, fundo muito claro)
                        noteDiv.style.cssText = `font-size: 0.72rem; font-weight: 600; color: #0F172A; border-left: 4px solid ${note.cor || '#0284C7'}; margin-bottom: 3px; padding: 3px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-radius: 4px; display:flex; align-items:center; gap:6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`;

                        // Fake um opacity backgroundColor baseado no HEX
                        const hex = note.cor || '#0284C7';
                        noteDiv.style.background = `linear-gradient(90deg, ${hex}1A 0%, ${hex}0D 100%)`;
                        // fallback fallback
                        if (!noteDiv.style.background.includes('gradient')) noteDiv.style.background = '#F1F5F9';

                        noteDiv.innerHTML = `<span style="opacity:0.8; font-size:0.65rem;">${note.hora_inicio}</span> <span style="flex:1; overflow:hidden; text-overflow:ellipsis;">${note.texto}</span>`;
                        noteDiv.title = `Cliente: ${note.texto} \nServiço: ${note.servico || 'N/A'} \nObs: ${note.observacao || 'N/A'}`;
                        noteDiv.onclick = (e) => { e.stopPropagation(); window.abrirModalNovaAula({ ...note, isReposicao }); };

                        noteDiv.onmouseover = () => { noteDiv.style.filter = 'brightness(0.95)'; };
                        noteDiv.onmouseout = () => { noteDiv.style.filter = 'brightness(1)'; };

                        td.appendChild(noteDiv);
                    });
                }

                td.onclick = (e) => {
                    if (e.target === td) window.abrirModalNovaAula({ data_evento: dateIso, hora_inicio: time, profissional: 'Cadastro de cliente/aluno', cor: isReposicao ? '#f97316' : '#06b6d4', isReposicao });
                };

                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        viewArea.appendChild(wrapper);
        if (window.lucide) window.lucide.createIcons();
    }

    function renderListView(viewArea, monthTitle, filteredNotes) {
        // Redireciona para o Timeline pois ele suporta e é o default desejado.
        renderTimelineView(viewArea, monthTitle, filteredNotes, 1);
    }

    function renderAniversariantesView(viewArea, monthTitle, filteredNotes) {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const ptBRMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthTitle.innerHTML = `<i data-lucide="cake" style="color:#EA580C; margin-right:8px; width:20px; display:inline-block; vertical-align:middle;"></i> Aniversariantes de ${ptBRMonths[month]} ${year}`;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-scrollbar fade-in';
        wrapper.style.cssText = 'flex:1; width: 100%; overflow:auto; background:white; border-radius: 8px; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; align-items: start; align-content: start;';

        const monthStr = (month + 1).toString().padStart(2, '0');
        const aniversariantesDOMes = filteredNotes.filter(n => n.isBirthday === true && n.data_evento.startsWith(`${year}-${monthStr}`));

        if (aniversariantesDOMes.length === 0) {
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            wrapper.innerHTML = `<i data-lucide="party-popper" style="width:48px; height:48px; color:#CBD5E1; margin-bottom:1rem;"></i><h4 style="color:var(--dark); font-weight:700;">Nenhum aniversário</h4><p style="color:var(--text-muted); font-size:0.85rem;">Nenhum aluno faz aniversário neste mês ativo.</p>`;
        } else {
            aniversariantesDOMes.sort((a, b) => a.data_evento.localeCompare(b.data_evento)).forEach(aniv => {
                const day = aniv.data_evento.split('-')[2];
                const parts = aniv.texto.split('Aniv. ');
                const nome = parts[1] ? parts[1] : aniv.texto;
                const isToday = aniv.data_evento === getLocalISO(new Date());

                const card = document.createElement('div');
                card.style.cssText = `background: ${isToday ? '#FFF7ED' : '#F8FAFC'}; border: 1px solid ${isToday ? '#FED7AA' : '#E2E8F0'}; border-radius: 12px; padding: 1rem; display:flex; align-items:center; gap:12px; transition: all 0.2s; cursor:pointer; box-shadow: ${isToday ? '0 4px 15px rgba(234, 88, 12, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)'};`;
                card.innerHTML = `
                    <div style="background:${isToday ? '#EA580C' : 'white'}; color:${isToday ? 'white' : '#475569'}; border:1px solid ${isToday ? '#EA580C' : '#E2E8F0'}; width:40px; height:40px; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0;">
                        <span style="font-size:0.5rem; font-weight:700; text-transform:uppercase; line-height:1;">Dia</span>
                        <span style="font-size:1rem; font-weight:800; line-height:1; margin-top:2px;">${day}</span>
                    </div>
                    <div style="flex:1; overflow:hidden;">
                        <div style="font-weight:700; font-size:0.9rem; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nome}</div>
                        <div style="font-size:0.75rem; color:#64748B; margin-top:2px; display:flex; align-items:center; gap:4px;">${isToday ? '<i data-lucide="cake" style="width:12px; color:#EA580C;"></i> Hoje!' : 'Este mês'}</div>
                    </div>
                `;
                card.onmouseover = () => card.style.transform = 'translateY(-2px)';
                card.onmouseout = () => card.style.transform = 'none';
                wrapper.appendChild(card);
            });
        }

        viewArea.innerHTML = '';
        viewArea.appendChild(wrapper);
        if (window.lucide) window.lucide.createIcons();
    }

    // --- Lógica de Reposições de Aula (Agenda Paralela) ---
    window.renderReposicoes = () => {
        const viewArea = document.getElementById('calendar-reposicao-view-area');
        const monthTitle = document.getElementById('cal-reposicao-month-title');

        if (!viewArea || !monthTitle) return;

        let reposicoes = [];
        try { reposicoes = JSON.parse(localStorage.getItem('movia_reposicoes') || '[]'); } catch (e) { }

        // Usa a mesmíssima estrutura de calendário em formato semanal
        renderTimelineView(viewArea, monthTitle, reposicoes, 7, true);
    };
    // --- Lógica de Controle das Abas da Agenda ---
    const btnSubAgenda = document.getElementById('btn-sub-agenda');
    const btnSubRepos = document.getElementById('btn-sub-reposicoes');
    const containerAgenda = document.getElementById('container-agenda-calendario');
    const containerRepos = document.getElementById('container-agenda-reposicoes');
    const filtersRow = document.getElementById('agenda-filters-row');

    if (btnSubAgenda && btnSubRepos) {
        btnSubAgenda.addEventListener('click', () => {
            btnSubAgenda.classList.add('active');
            btnSubAgenda.style.background = 'white';
            btnSubAgenda.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            btnSubRepos.classList.remove('active');
            btnSubRepos.style.background = 'transparent';
            btnSubRepos.style.boxShadow = 'none';

            containerRepos.style.display = 'none';
            containerAgenda.style.display = 'flex';
            if (filtersRow) filtersRow.style.display = 'flex';

            renderCalendar();
        });

        btnSubRepos.addEventListener('click', () => {
            btnSubRepos.classList.add('active');
            btnSubRepos.style.background = 'white';
            btnSubRepos.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            btnSubAgenda.classList.remove('active');
            btnSubAgenda.style.background = 'transparent';
            btnSubAgenda.style.boxShadow = 'none';

            containerAgenda.style.display = 'none';
            containerRepos.style.display = 'flex';
            if (filtersRow) filtersRow.style.display = 'none';

            if (window.renderReposicoes) window.renderReposicoes();
        });
    }

    // Eventos do calendário de reposicao
    const handleRepoNav = (days) => { currentCalDate.setDate(currentCalDate.getDate() + days); window.renderReposicoes(); };
    document.getElementById('btn-cal-reposicao-next')?.addEventListener('click', () => handleRepoNav(7));
    document.getElementById('btn-cal-reposicao-prev')?.addEventListener('click', () => handleRepoNav(-7));
    document.getElementById('btn-cal-reposicao-hoje')?.addEventListener('click', () => { currentCalDate = new Date(); window.renderReposicoes(); });
    // Controller events for Calendar
    const btnCalNext = document.getElementById('btn-cal-next');
    if (btnCalNext) btnCalNext.addEventListener('click', () => {
        if (currentAgendaMode === 'month') {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        } else if (currentAgendaMode === 'week') {
            currentCalDate.setDate(currentCalDate.getDate() + 7);
        } else if (currentAgendaMode === 'three_days') {
            currentCalDate.setDate(currentCalDate.getDate() + 3);
        } else if (currentAgendaMode === 'day') {
            currentCalDate.setDate(currentCalDate.getDate() + 1);
        }
        renderCalendar();
    });

    const btnCalPrev = document.getElementById('btn-cal-prev');
    if (btnCalPrev) btnCalPrev.addEventListener('click', () => {
        if (currentAgendaMode === 'month') {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        } else if (currentAgendaMode === 'week') {
            currentCalDate.setDate(currentCalDate.getDate() - 7);
        } else if (currentAgendaMode === 'three_days') {
            currentCalDate.setDate(currentCalDate.getDate() - 3);
        } else if (currentAgendaMode === 'day') {
            currentCalDate.setDate(currentCalDate.getDate() - 1);
        }
        renderCalendar();
    });

    const btnCalHoje = document.getElementById('btn-cal-hoje');
    if (btnCalHoje) btnCalHoje.addEventListener('click', () => { currentCalDate = new Date(); renderCalendar(); });

    const btnNovaNotacaoOld = document.getElementById('btn-nova-anotacao');
    if (btnNovaNotacaoOld) btnNovaNotacaoOld.addEventListener('click', () => {
        document.getElementById('ipt-anotacao-data').value = getLocalISO(new Date());
        document.getElementById('ipt-anotacao-hora-ini').value = '';
        document.getElementById('ipt-anotacao-hora-fim').value = '';
        document.getElementById('ipt-anotacao-cliente').value = '';
        document.getElementById('ipt-anotacao-servico').value = '';
        document.getElementById('ipt-anotacao-profissional').value = '';
        document.getElementById('ipt-anotacao-observacao').value = '';
        document.getElementById('ipt-anotacao-id').value = '';
        document.querySelectorAll('.chk-anotacao-dia').forEach(c => c.checked = false);

        const dataListAnot = document.getElementById('lista-alunos-anotacao');
        if (dataListAnot && dataListAnot.options.length === 0) {
            let alunosLoad = [];
            try {
                const fromLS = JSON.parse(localStorage.getItem('movia_alunos') || '[]');
                if (fromLS.length > 0) alunosLoad = fromLS;
            } catch (e) { }
            if (alunosLoad.length === 0 && window.cachedAlunos) alunosLoad = window.cachedAlunos;
            if (alunosLoad.length > 0) {
                alunosLoad.forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.nome;
                    dataListAnot.appendChild(opt);
                });
            } else if (supabase && typeof supabase !== 'undefined' && supabase.from) {
                supabase.from('alunos').select('nome').then(({ data }) => {
                    if (data) {
                        data.forEach(a => {
                            const opt = document.createElement('option');
                            opt.value = a.nome;
                            dataListAnot.appendChild(opt);
                        });
                    }
                });
            }
        }

        slideAgenda.classList.remove('hidden-overlay');
        setTimeout(() => slideAgenda.classList.add('open'), 10);
    });

    const closeAgendaBtns = document.querySelectorAll('.close-slide-agenda');
    closeAgendaBtns.forEach(btn => btn.addEventListener('click', () => {
        slideAgenda.classList.remove('open');
        setTimeout(() => slideAgenda.classList.add('hidden-overlay'), 300);
    }));

    // Lógica das cores Anotação
    const colorBtnsAnot = document.querySelectorAll('.color-picker-anotacao');
    const iptColorAnot = document.getElementById('ipt-anotacao-color');
    colorBtnsAnot.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtnsAnot.forEach(b => { b.classList.remove('active'); b.innerHTML = ''; });
            btn.classList.add('active');
            btn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px;"></i>';
            if (iptColorAnot) iptColorAnot.value = btn.dataset.color;
            if (window.lucide) window.lucide.createIcons();
        });
    });

    const btnSalvarAnotacao = document.getElementById('btn-salvar-agenda');
    if (btnSalvarAnotacao) {
        btnSalvarAnotacao.addEventListener('click', async () => {
            const dataTarget = document.getElementById('ipt-anotacao-data').value;
            const horaIni = document.getElementById('ipt-anotacao-hora-ini').value;
            const horaFim = document.getElementById('ipt-anotacao-hora-fim').value;
            const servicoTarget = document.getElementById('ipt-anotacao-servico').value;
            const prof = document.getElementById('ipt-anotacao-profissional').value;
            const textoCliente = document.getElementById('ipt-anotacao-cliente').value;

            // Dias da semana S T Q Q S S
            const diasSelecionados = Array.from(document.querySelectorAll('.chk-anotacao-dia'))
                .filter(c => c.checked)
                .map(c => parseInt(c.value));

            const cor = document.getElementById('ipt-anotacao-color').value;
            const obs = document.getElementById('ipt-anotacao-observacao').value;
            const id = document.getElementById('ipt-anotacao-id').value;

            if (!textoCliente || !dataTarget) { alert("Preencha ao menos o nome do Cliente (ou grupo) e a Data."); return; }

            const isDbId = id && !id.startsWith('local_');
            const isEditing = !!id;

            let datasParaSalvar = [];
            if (!isEditing && diasSelecionados.length > 0) {
                const dataBase = new Date(dataTarget + 'T12:00:00');
                for (let week = 0; week < 12; week++) { // Agendar por 12 semanas
                    diasSelecionados.forEach(diaInt => {
                        const dayOfBase = dataBase.getDay();
                        let diff = diaInt - dayOfBase;
                        let ms = dataBase.getTime() + (week * 7 * 86400000) + (diff * 86400000);
                        let dt = new Date(ms);
                        let isoDate = dt.toISOString().split('T')[0];
                        if (isoDate >= dataTarget) {
                            datasParaSalvar.push(isoDate);
                        }
                    });
                }
                datasParaSalvar = Array.from(new Set(datasParaSalvar)).sort();
            } else {
                datasParaSalvar.push(dataTarget);
            }

            const originalBtn = btnSalvarAnotacao.innerHTML;
            btnSalvarAnotacao.innerHTML = 'Salvando...';

            let agendaLocal = [];
            try { agendaLocal = JSON.parse(localStorage.getItem('movia_agenda') || '[]'); } catch (e) { }

            let dbInserts = [];

            datasParaSalvar.forEach((dtLoop, index) => {
                const localIdVal = (isDbId && index === 0) ? ('local_' + id) : (isEditing ? id : 'local_' + Date.now().toString() + '_' + index);
                const dbTextPayload = {
                    texto: textoCliente,
                    hora_inicio: horaIni,
                    hora_fim: horaFim,
                    servico: servicoTarget,
                    profissional: prof,
                    cor: cor,
                    observacao: obs,
                    status: 'Confirmado'
                };
                const payloadStr = JSON.stringify(dbTextPayload);

                const memoryPayload = {
                    ...dbTextPayload,
                    data_evento: dtLoop,
                    localId: localIdVal
                };

                if (isDbId && index === 0) memoryPayload.id = id;

                if (isEditing && index === 0) {
                    agendaLocal = agendaLocal.map(n => (n.id == id || n.localId == id) ? memoryPayload : n);
                } else {
                    agendaLocal.push(memoryPayload);
                }

                if (supabase && typeof supabase !== 'undefined' && supabase.from) {
                    if (isDbId && index === 0) {
                        supabase.from('agenda').update({ data_evento: dtLoop, texto: payloadStr }).eq('id', id).then().catch(() => { });
                    } else {
                        dbInserts.push({ data_evento: dtLoop, texto: payloadStr, memId: localIdVal });
                    }
                }
            });

            localStorage.setItem('movia_agenda', JSON.stringify(agendaLocal));

            if (supabase && typeof supabase !== 'undefined' && supabase.from && dbInserts.length > 0) {
                const onlyBdPush = dbInserts.map(d => ({ data_evento: d.data_evento, texto: d.texto }));
                supabase.from('agenda').insert(onlyBdPush).select('id, data_evento, texto').then().catch(() => { });
            }

            slideAgenda.classList.remove('open');
            setTimeout(() => slideAgenda.classList.add('hidden-overlay'), 300);
            setTimeout(() => { renderCalendar(); }, 100);
            btnSalvarAnotacao.innerHTML = originalBtn;
        });
    }

    // Lógica do Modal Nova Aula
    window.fecharModalNovaAula = () => {
        const modal = document.getElementById('modal-nova-aula');
        if (modal) modal.style.display = 'none';
    };

    const fecharModalBtns = document.querySelectorAll('.close-modal-nova-aula');
    fecharModalBtns.forEach(btn => btn.addEventListener('click', window.fecharModalNovaAula));

    // Lógica das cores do Modal
    const colorBtns = document.querySelectorAll('.color-picker-btn');
    const iptColor = document.getElementById('ipt-agenda-color');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => {
                b.classList.remove('active');
                b.innerHTML = '';
            });
            btn.classList.add('active');
            btn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px;"></i>';
            iptColor.value = btn.dataset.color;
            if (window.lucide) window.lucide.createIcons();
        });
    });

    window.abrirModalNovaAula = (dadosPre = {}) => {
        window.currentEditingMode = dadosPre.isReposicao ? 'reposicao' : 'agenda';

        const modal = document.getElementById('modal-nova-aula');
        const title = document.getElementById('title-modal-nova-aula');

        const selCliente = document.getElementById('ipt-agenda-cliente');
        const selProf = document.getElementById('ipt-agenda-profissional');

        const dataListCliente = document.getElementById('lista-alunos-agenda');
        if (dataListCliente && dataListCliente.options.length === 0) {
            let alunosLoad = [];
            try {
                const fromLS = JSON.parse(localStorage.getItem('movia_alunos') || '[]');
                if (fromLS.length > 0) alunosLoad = fromLS;
            } catch (e) { }
            if (alunosLoad.length === 0 && window.cachedAlunos) {
                alunosLoad = window.cachedAlunos;
            }
            if (alunosLoad.length > 0) {
                alunosLoad.forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.nome;
                    dataListCliente.appendChild(opt);
                });
            } else if (supabase) {
                supabase.from('alunos').select('nome').then(({ data }) => {
                    if (data) {
                        data.forEach(a => {
                            const opt = document.createElement('option');
                            opt.value = a.nome;
                            dataListCliente.appendChild(opt);
                        });
                    }
                });
            }
        }

        // Campo profissional agora é input livre

        document.getElementById('ipt-agenda-id').value = dadosPre.id || dadosPre.localId || '';
        document.getElementById('ipt-agenda-data').value = dadosPre.data_evento || '';
        document.getElementById('ipt-agenda-hora-ini').value = dadosPre.hora_inicio || '';
        document.getElementById('ipt-agenda-hora-fim').value = dadosPre.hora_fim || '';
        if (selProf) selProf.value = (dadosPre.profissional && dadosPre.profissional !== 'Cadastro de cliente/aluno') ? dadosPre.profissional : '';
        document.getElementById('ipt-agenda-servico').value = dadosPre.servico || '';
        document.getElementById('ipt-agenda-observacao').value = dadosPre.observacao || '';
        if (selCliente) selCliente.value = dadosPre.texto || '';

        // Limpar checkboxes de dias da semana
        document.querySelectorAll('.chk-dia-semana').forEach(c => c.checked = false);

        const cor = dadosPre.cor || '#06b6d4';
        iptColor.value = cor;
        colorBtns.forEach(b => { b.innerHTML = ''; b.classList.remove('active'); });
        const cBtn = Array.from(colorBtns).find(b => b.dataset.color === cor);
        if (cBtn) {
            cBtn.classList.add('active');
            cBtn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px;"></i>';
        }

        const acoesEdicao = document.getElementById('acoes-edicao-aula');
        if (dadosPre.id || dadosPre.localId) {
            title.innerText = 'Editar Aula';
            acoesEdicao.style.display = 'flex';
        } else {
            title.innerText = 'Nova Aula';
            acoesEdicao.style.display = 'none';
        }

        modal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    };

    const btnSalvarModal = document.getElementById('btn-salvar-modal-aula');
    if (btnSalvarModal) {
        btnSalvarModal.addEventListener('click', async () => {
            const dataTarget = document.getElementById('ipt-agenda-data').value;
            const horaIni = document.getElementById('ipt-agenda-hora-ini').value;
            const horaFim = document.getElementById('ipt-agenda-hora-fim').value;
            const servicoTarget = document.getElementById('ipt-agenda-servico').value;
            const prof = document.getElementById('ipt-agenda-profissional').value;
            const textoCliente = document.getElementById('ipt-agenda-cliente').value;

            // Dias da semana S T Q Q S S
            const diasSelecionados = Array.from(document.querySelectorAll('.chk-dia-semana'))
                .filter(c => c.checked)
                .map(c => parseInt(c.value));

            const cor = document.getElementById('ipt-agenda-color').value;
            const obs = document.getElementById('ipt-agenda-observacao').value;
            const id = document.getElementById('ipt-agenda-id').value;

            if (!textoCliente || !dataTarget) { alert("Selecione o Cliente e a Data da aula."); return; }

            const isDbId = id && !id.startsWith('local_');
            const isEditing = !!id;

            let datasParaSalvar = [];
            if (!isEditing && diasSelecionados.length > 0) {
                const dataBase = new Date(dataTarget + 'T12:00:00');
                for (let week = 0; week < 12; week++) { // Agendar por 12 semanas (aprox 3 meses)
                    diasSelecionados.forEach(diaInt => {
                        const dayOfBase = dataBase.getDay();
                        let diff = diaInt - dayOfBase;
                        let ms = dataBase.getTime() + (week * 7 * 86400000) + (diff * 86400000);
                        let dt = new Date(ms);
                        let isoDate = dt.toISOString().split('T')[0];
                        if (isoDate >= dataTarget) { // Só futuras em relação à data base
                            datasParaSalvar.push(isoDate);
                        }
                    });
                }
                // Organiza chronos
                datasParaSalvar = Array.from(new Set(datasParaSalvar)).sort();
            } else {
                // Edição ou sem repetição: salva só nesta data mesmo
                datasParaSalvar.push(dataTarget);
            }

            const isModoRepo = (window.currentEditingMode === 'reposicao');
            const targetCache = isModoRepo ? 'movia_reposicoes_db' : 'movia_agenda';

            const originalBtn = btnSalvarModal.innerHTML;
            btnSalvarModal.innerHTML = 'Salvando...';

            let agendaLocal = [];
            try { agendaLocal = JSON.parse(localStorage.getItem(targetCache) || '[]'); } catch (e) { }

            let dbInserts = [];

            datasParaSalvar.forEach((dtLoop, index) => {
                const localIdVal = (isDbId && index === 0) ? ('local_' + id) : (isEditing ? id : 'local_' + Date.now().toString() + '_' + index);
                const dbTextPayload = {
                    texto: textoCliente,
                    hora_inicio: horaIni,
                    hora_fim: horaFim,
                    servico: servicoTarget,
                    profissional: prof,
                    cor: cor,
                    observacao: obs,
                    status: isModoRepo ? 'Pendente' : 'Confirmado'
                };
                const payloadStr = JSON.stringify(dbTextPayload);

                const memoryPayload = {
                    ...dbTextPayload,
                    data_evento: dtLoop,
                    localId: localIdVal
                };

                if (isDbId && index === 0) memoryPayload.id = id;

                if (isEditing && index === 0) {
                    agendaLocal = agendaLocal.map(n => (n.id == id || n.localId == id) ? memoryPayload : n);
                } else {
                    agendaLocal.push(memoryPayload);
                }

                if (supabase && !isModoRepo) {
                    if (isDbId && index === 0) {
                        supabase.from('agenda').update({ data_evento: dtLoop, texto: payloadStr }).eq('id', id).then().catch(() => { });
                    } else {
                        dbInserts.push({ data_evento: dtLoop, texto: payloadStr, memId: localIdVal });
                    }
                }
            });

            localStorage.setItem(targetCache, JSON.stringify(agendaLocal));

            if (supabase && !isModoRepo && dbInserts.length > 0) {
                const onlyBdPush = dbInserts.map(d => ({ data_evento: d.data_evento, texto: d.texto }));
                supabase.from('agenda').insert(onlyBdPush).select('id, data_evento, texto').then().catch(() => { });
            }

            window.fecharModalNovaAula();
            setTimeout(() => {
                if (isModoRepo) renderReposicoes(); else renderCalendar();
            }, 100);
            btnSalvarModal.innerHTML = originalBtn;
        });
    }

    const btnExcluirModal = document.getElementById('btn-excluir-modal-aula');
    if (btnExcluirModal) {
        btnExcluirModal.addEventListener('click', async () => {
            const id = document.getElementById('ipt-agenda-id').value;
            if (!id) return;
            if (!confirm('Deseja excluir esta aula permanentemente?')) return;
            const isModoRepo = (window.currentEditingMode === 'reposicao');
            const targetCache = isModoRepo ? 'movia_reposicoes_db' : 'movia_agenda';

            let agendaLocal = [];
            try { agendaLocal = JSON.parse(localStorage.getItem(targetCache) || '[]'); } catch (e) { }
            agendaLocal = agendaLocal.filter(n => n.id != id && n.localId != id);
            localStorage.setItem(targetCache, JSON.stringify(agendaLocal));

            if (supabase && id && !id.startsWith('local_') && !isModoRepo) {
                supabase.from('agenda').delete().eq('id', id).then().catch(() => { });
            }
            window.fecharModalNovaAula();

            if (isModoRepo) renderReposicoes(); else renderCalendar();
        });
    }

    const btnDuplicarModal = document.getElementById('btn-duplicar-modal-aula');
    if (btnDuplicarModal) {
        btnDuplicarModal.addEventListener('click', () => {
            document.getElementById('ipt-agenda-id').value = '';
            document.getElementById('title-modal-nova-aula').innerText = 'Nova Aula (Cópia)';
            document.getElementById('acoes-edicao-aula').style.display = 'none';
        });
    }

    // Inicialização da Agenda
    renderCalendar();

    // Abrir/Fechar Slide Financeiro
    window.openFinSlide = (tipo) => {
        document.getElementById('ipt-fin-tipo').value = tipo;
        document.getElementById('fin-modal-title').innerText = tipo === 'receita' ? 'Nova Entrada (Receita)' : 'Nova Saída (Despesa)';
        document.getElementById('slide-over-financeiro').classList.remove('hidden-overlay');
        setTimeout(() => document.getElementById('slide-over-financeiro').classList.add('open'), 10);
    };

    // --- Lógica de Ajustes (Dark Mode e Logout) ---
    // Logout
    const btnLogout = document.getElementById('btn-logout');
    const btnLogoutTopbar = document.getElementById('btn-logout-topbar');

    const handleLogout = async () => {
        if (confirm('Tem certeza que deseja sair do sistema?')) {
            if (btnLogout) btnLogout.innerHTML = 'Saindo...';
            if (supabase) await supabase.auth.signOut();
            window.location.href = 'index.html';
        }
    };

    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    if (btnLogoutTopbar) btnLogoutTopbar.addEventListener('click', handleLogout);

    // Sistema de Avatar (Foto de Perfil)
    const uploadAvatar = document.getElementById('ipt-avatar-upload');
    const topbarAvatar = document.getElementById('topbar-user-avatar');
    const sideAvatar = document.querySelector('.avatar-sm');

    // Carregar Avatar local se existir
    const savedAvatar = localStorage.getItem('movia_user_avatar');
    const savedAvatarPos = localStorage.getItem('movia_user_avatar_pos') || '50% 50%';

    if (topbarAvatar) {
        if (savedAvatar) topbarAvatar.src = savedAvatar;
        topbarAvatar.style.objectPosition = savedAvatarPos;
        topbarAvatar.style.cursor = 'grab';
    }
    if (sideAvatar) {
        if (savedAvatar) sideAvatar.src = savedAvatar;
        sideAvatar.style.objectPosition = savedAvatarPos;
    }

    if (uploadAvatar) {
        uploadAvatar.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const base64Image = evt.target.result;
                    if (topbarAvatar) { topbarAvatar.src = base64Image; topbarAvatar.style.objectPosition = '50% 50%'; }
                    if (sideAvatar) { sideAvatar.src = base64Image; sideAvatar.style.objectPosition = '50% 50%'; }
                    localStorage.setItem('movia_user_avatar', base64Image);
                    localStorage.setItem('movia_user_avatar_pos', '50% 50%');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Drag para reposicionar foto
    if (topbarAvatar) {
        let isDraggingAvatar = false;
        let startX, startY;
        let currentPosX, currentPosY;

        topbarAvatar.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingAvatar = true;
            topbarAvatar.style.cursor = 'grabbing';
            startX = e.clientX;
            startY = e.clientY;

            // Extract current percentages
            const pos = topbarAvatar.style.objectPosition || '50% 50%';
            const parts = pos.split(' ');
            currentPosX = parseFloat(parts[0]) || 50;
            currentPosY = parseFloat(parts[1]) || 50;

            // Evitar fechar dropdown ao clicar para arrastar
            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingAvatar) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Sensibilidade do arrasto
            const sensitivity = 0.5;
            let newX = currentPosX - (deltaX * sensitivity);
            let newY = currentPosY - (deltaY * sensitivity);

            // Limitar a porcentagem entre 0 e 100
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            const newPos = `${newX}% ${newY}%`;
            topbarAvatar.style.objectPosition = newPos;
            if (sideAvatar) sideAvatar.style.objectPosition = newPos;
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingAvatar) {
                isDraggingAvatar = false;
                topbarAvatar.style.cursor = 'grab';
                localStorage.setItem('movia_user_avatar_pos', topbarAvatar.style.objectPosition);
            }
        });
    }

    // Theme Control
    const btnSetDark = document.getElementById('btn-toggle-theme');
    const btnSetLight = document.getElementById('btn-set-light');

    const currentTheme = localStorage.getItem('movia_theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    if (btnSetDark) {
        btnSetDark.addEventListener('click', () => {
            document.body.classList.add('dark-theme');
            localStorage.setItem('movia_theme', 'dark');
            lucide.createIcons();
        });
    }

    if (btnSetLight) {
        btnSetLight.addEventListener('click', () => {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('movia_theme', 'light');
            lucide.createIcons();
        });
    }


    // Iniciar render do calendário quando clicar na tab Agenda
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target === 'agenda') {
                renderCalendar();
            }
        });
    });

    // --- Máscara de Moeda Global ---
    window.maskCurrency = function (input) {
        let value = input.value.replace(/\D/g, '');
        if (value === '') {
            input.value = '';
            return;
        }
        let number = (parseFloat(value) / 100).toFixed(2);
        let parts = number.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = parts.join(',');
    };

    // --- Toggle de Status Global ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('status-btn')) {
            const container = e.target.parentElement;
            const hiddenInput = container.previousElementSibling;

            // Limpa demais botões
            container.querySelectorAll('.status-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = '#6B7280';
            });
            // Ativa o clicado
            e.target.style.background = 'white';
            e.target.style.color = e.target.dataset.val === 'Pago' ? '#10B981' : '#EF4444';

            if (hiddenInput && hiddenInput.type === 'hidden') hiddenInput.value = e.target.dataset.val;
        }
    });

    // --- Lógica da Busca Global ---
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            document.querySelectorAll('.aluno-card, .aluno-row, .fin-row').forEach(el => {
                const text = el.innerText.toLowerCase();
                el.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // --- Lógica de Reposicionamento de Imagem da Lojinha ---
    let isDraggingImg = false;
    let startY = 0;
    let currentOffset = 50;
    let currentImg = null;

    const endDragObj = () => {
        if (isDraggingImg && currentImg) {
            isDraggingImg = false;
            currentImg.style.transition = 'object-position 0.2s';
            const stylePos = currentImg.style.objectPosition || '50% 50%';
            const finalOffset = parseFloat(stylePos.split(' ')[1]) || 50;
            const prodId = currentImg.dataset.id;

            let agendaLocal = [];
            try { agendaLocal = JSON.parse(localStorage.getItem('movia_loja') || '[]'); } catch (e) { }
            agendaLocal = agendaLocal.map(p => {
                if (p.id == prodId || p.localId == prodId) return { ...p, fotoOffset: finalOffset };
                return p;
            });
            localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));
            // Supabase update silencioso na coluna custom ou ignorado caso não exista
            if (supabase) supabase.from('lojinha').update({ fotoOffset: finalOffset }).eq('id', prodId).catch(() => { });
            currentImg = null;
        }
    };

    document.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('card-img-draggable')) {
            isDraggingImg = true;
            startY = e.clientY;
            const stylePos = e.target.style.objectPosition || '50% 50%';
            currentOffset = parseFloat(stylePos.split(' ')[1]) || 50;
            currentImg = e.target;
            currentImg.style.transition = 'none';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingImg || !currentImg) return;
        const deltaY = e.clientY - startY;
        let newOffset = currentOffset - (deltaY * 0.3); // sensitivity
        if (newOffset < 0) newOffset = 0;
        if (newOffset > 100) newOffset = 100;
        currentImg.style.objectPosition = `50% ${newOffset}%`;
    });

    document.addEventListener('mouseup', endDragObj);

    // Suporte mobile (touch)
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('card-img-draggable')) {
            isDraggingImg = true;
            startY = e.touches[0].clientY;
            const stylePos = e.target.style.objectPosition || '50% 50%';
            currentOffset = parseFloat(stylePos.split(' ')[1]) || 50;
            currentImg = e.target;
            currentImg.style.transition = 'none';
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDraggingImg || !currentImg) return;
        e.preventDefault();
        const deltaY = e.touches[0].clientY - startY;
        let newOffset = currentOffset - (deltaY * 0.3);
        if (newOffset < 0) newOffset = 0;
        if (newOffset > 100) newOffset = 100;
        currentImg.style.objectPosition = `50% ${newOffset}%`;
    }, { passive: false });

    document.addEventListener('touchend', endDragObj);

    // --- Lógica do Módulo Lojinha ---
    const slideProduto = document.getElementById('slide-over-produto');
    const slideVenda = document.getElementById('slide-over-venda');

    window.currentLojaFilter = 'todos';
    window.currentLojaVendaFilter = 'todas';
    window.currentLojaTab = 'produtos';

    window.switchLojaTab = (tab) => {
        window.currentLojaTab = tab;
        document.querySelectorAll('#view-loja .tab-btn').forEach(btn => {
            if (btn.getAttribute('data-lojatab') === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        document.querySelectorAll('#view-loja .tab-panel').forEach(panel => {
            if (panel.id === `loja-tab-${tab}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        window.loadLojinha();
    };

    window.setLojaFilter = (filter, el) => {
        window.currentLojaFilter = filter;
        if (el) {
            document.querySelectorAll('#loja-filters-cat .filter-chip').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }
        window.loadLojinha();
    };

    window.setLojaVendaFilter = (filter, el) => {
        window.currentLojaVendaFilter = filter;
        if (el) {
            document.querySelectorAll('#loja-tab-vendas .filter-chip').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }
        window.loadLojinha();
    };

    window.loadLojinha = async () => {
        let produtos = [];
        try { produtos = JSON.parse(localStorage.getItem('movia_loja') || '[]'); } catch (e) { }

        if (supabase) {
            try {
                const { data } = await supabase.from('lojinha').select('*');
                if (data && data.length > 0) {
                    data.forEach(p => {
                        if (!produtos.some(loc => loc.id == p.id || loc.nome === p.nome)) produtos.push(p);
                    });
                }
            } catch (e) { }
        }

        // Seeder inicial se a loja estiver vazia
        if (produtos.length === 0) {
            produtos = [
                {
                    id: 'p1',
                    localId: 'p1',
                    nome: 'Calça Legging Cross',
                    categoria: 'Roupas',
                    preco: 89.90,
                    variacoes: 'P, M, G',
                    variacoesStock: { 'P': 8, 'M': 5, 'G': 2 },
                    vendas: []
                },
                {
                    id: 'p2',
                    localId: 'p2',
                    nome: 'Meia de Pilates Antiderrapante',
                    categoria: 'Acessórios',
                    preco: 29.90,
                    variacoes: '',
                    estoque: 15,
                    vendas: []
                },
                {
                    id: 'p3',
                    localId: 'p3',
                    nome: 'Camiseta Dry Fit Feminina',
                    categoria: 'Roupas',
                    preco: 49.90,
                    variacoes: 'P, M, G',
                    variacoesStock: { 'P': 2, 'M': 0, 'G': 1 },
                    vendas: []
                },
                {
                    id: 'p4',
                    localId: 'p4',
                    nome: 'Tapete de Yoga 6mm',
                    categoria: 'Acessórios',
                    preco: 119.90,
                    variacoes: '',
                    estoque: 0,
                    vendas: []
                }
            ];
            localStorage.setItem('movia_loja', JSON.stringify(produtos));
        }

        window.updateLojinhaKPIs(produtos);

        if (window.currentLojaTab === 'produtos') {
            window.renderLojinhaProdutos(produtos);
        } else if (window.currentLojaTab === 'vendas') {
            window.renderLojinhaVendas(produtos);
        } else if (window.currentLojaTab === 'estoque') {
            window.renderLojinhaEstoque(produtos);
        }
    };

    window.updateLojinhaKPIs = (produtos) => {
        let faturamento = 0;
        let qtdPagas = 0;
        let qtdAtivos = produtos.length;
        let qtdBaixoEstoque = 0;
        let qtdPendentesVal = 0;

        produtos.forEach(p => {
            let isLow = false;
            if (p.variacoes) {
                const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                list.forEach(v => {
                    const qty = p.variacoesStock && p.variacoesStock[v] !== undefined ? Number(p.variacoesStock[v]) : 0;
                    if (qty <= 3) isLow = true;
                });
            } else {
                const qty = Number(p.estoque || 0);
                if (qty <= 3) isLow = true;
            }
            if (isLow) qtdBaixoEstoque++;

            if (p.vendas) {
                p.vendas.forEach(v => {
                    const val = Number(v.total) || Number(v.valor) || Number(p.preco || 0);
                    if (v.status === 'Pago') {
                        faturamento += val;
                        qtdPagas++;
                    } else {
                        qtdPendentesVal++;
                    }
                });
            }
        });

        const elFat = document.getElementById('lojinha-kpi-fat') || document.getElementById('loja-kpi-fat');
        const elFatSub = document.getElementById('lojinha-kpi-fat-sub') || document.getElementById('loja-kpi-fat-sub');
        const elAtivos = document.getElementById('lojinha-kpi-ativos') || document.getElementById('loja-kpi-ativos');
        const elBaixo = document.getElementById('lojinha-kpi-baixo') || document.getElementById('loja-kpi-baixo');
        const elPendentes = document.getElementById('lojinha-kpi-pendentes') || document.getElementById('loja-kpi-pendentes');

        if (elFat) elFat.innerText = `R$ ${faturamento.toFixed(2).replace('.', ',')}`;
        if (elFatSub) elFatSub.innerText = qtdPagas;
        if (elAtivos) elAtivos.innerText = qtdAtivos;
        if (elBaixo) elBaixo.innerText = qtdBaixoEstoque;
        if (elPendentes) elPendentes.innerText = qtdPendentesVal;
    };

    window.renderLojinhaProdutos = (produtos) => {
        if (!produtos) {
            try { produtos = JSON.parse(localStorage.getItem('movia_loja') || '[]'); } catch(e) { produtos = []; }
        }
        const grid = document.getElementById('store-grid') || document.getElementById('loja-product-grid');
        const empty = document.getElementById('empty-state-loja');
        if (!grid) return;

        grid.innerHTML = '';
        grid.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';

        const searchVal = (document.getElementById('loja-global-search') ? document.getElementById('loja-global-search').value : '').toLowerCase().trim();

        const filtered = produtos.filter(p => {
            if (searchVal && !p.nome.toLowerCase().includes(searchVal) && !(p.categoria || '').toLowerCase().includes(searchVal)) {
                return false;
            }

            const catFilter = window.currentLojaFilter;
            if (catFilter === 'todos') return true;

            const categoryName = (p.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (catFilter === 'roupas') return categoryName.includes('roupa') || categoryName.includes('vestuario') || categoryName.includes('calcado');
            if (catFilter === 'acessorios') return categoryName.includes('acessorio') || categoryName.includes('equipamento') || categoryName.includes('objeto');
            
            if (catFilter === 'baixo') {
                if (p.variacoes) {
                    const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                    return list.some(v => (p.variacoesStock && p.variacoesStock[v] !== undefined ? Number(p.variacoesStock[v]) : 0) <= 3);
                } else {
                    return Number(p.estoque || 0) <= 3;
                }
            }
            if (catFilter === 'esgotados') {
                if (p.variacoes) {
                    const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                    return list.every(v => (p.variacoesStock && p.variacoesStock[v] !== undefined ? Number(p.variacoesStock[v]) : 0) === 0);
                } else {
                    return Number(p.estoque || 0) === 0;
                }
            }
            return true;
        });

        if (filtered.length === 0) {
            if (empty) empty.style.display = 'block';
        } else {
            if (empty) empty.style.display = 'none';
            filtered.forEach(p => {
                let varStockHtml = '';
                let totalEstoque = 0;
                if (p.variacoes) {
                    const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                    if (list.length > 0) {
                        varStockHtml = `<div style="display:flex; gap:6px; flex-wrap:wrap;">`;
                        list.forEach(v => {
                            const qty = p.variacoesStock && p.variacoesStock[v] !== undefined ? Number(p.variacoesStock[v]) : 0;
                            totalEstoque += qty;
                            const isLow = qty > 0 && qty <= 3;
                            const isOut = qty === 0;
                            const badgeColor = isOut ? 'background:#FEE2E2; color:#991B1B;' : (isLow ? 'background:#FEF3C7; color:#92400E;' : 'background:#F0FDF4; color:#166534;');
                            varStockHtml += `<span style="padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600; ${badgeColor}">${v}: ${qty} un</span>`;
                        });
                        varStockHtml += `</div>`;
                    }
                } else {
                    totalEstoque = Number(p.estoque || 0);
                    const isLow = totalEstoque > 0 && totalEstoque <= 3;
                    const isOut = totalEstoque === 0;
                    const badgeColor = isOut ? 'background:#FEE2E2; color:#991B1B;' : (isLow ? 'background:#FEF3C7; color:#92400E;' : 'background:#F0FDF4; color:#166534;');
                    varStockHtml = `<span style="padding:2px 6px; border-radius:4px; font-size:11px; font-weight:600; ${badgeColor}">Único: ${totalEstoque} un</span>`;
                }

                const card = document.createElement('div');
                card.style.cssText = 'background: white; border: 1px solid var(--border-soft); border-radius: 10px; display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; gap: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                        <div style="width:34px; height:34px; border-radius:6px; background:#F0FDF4; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i data-lucide="tag" style="width:16px; height:16px; color:#10B981;"></i>
                        </div>
                        <div style="min-width:0; flex:1;">
                            <div style="font-weight:600; font-size:14px; color:var(--text-dark); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.nome}</div>
                            <div style="font-size:11px; color:#6B7280; margin-top:2px;">Categoria: ${p.categoria || 'Outros'}</div>
                        </div>
                    </div>
                    
                    <div style="flex:1.5; display:flex; align-items:center; justify-content:flex-start; min-width:0;">
                        ${varStockHtml}
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; flex-shrink:0;">
                        <div style="font-weight:700; color:#10B981; font-size:15px; min-width:80px; text-align:right;">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</div>
                        
                        <button class="btn btn-primary btn-abrir-venda" data-id="${p.id || p.localId}" data-nome="${p.nome}" data-preco="${p.preco}" style="height:32px; font-size:12px; padding:0 12px; font-weight:600; border-radius:6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;" ${totalEstoque === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <i data-lucide="shopping-bag" style="width:13px; height:13px;"></i> Vender
                        </button>
                        
                        <button class="btn-icon btn-edit-prod" data-id="${p.id || p.localId}" style="width:32px; height:32px; border-radius:6px; background:#fff; border:1px solid #E5E7EB; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"><i data-lucide="pencil" style="width:13px; height:13px; color:#4B5563; pointer-events:none;"></i></button>
                        <button class="btn-icon btn-del-prod" data-id="${p.id || p.localId}" style="width:32px; height:32px; border-radius:6px; background:#fff; border:1px solid #FECACA; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"><i data-lucide="trash-2" style="width:13px; height:13px; color:#DC2626; pointer-events:none;"></i></button>
                    </div>
                `;
                grid.appendChild(card);
            });
            if (window.lucide) window.lucide.createIcons();

            document.querySelectorAll('.btn-abrir-venda').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const nome = e.currentTarget.dataset.nome;
                    const preco = e.currentTarget.dataset.preco;
                    const p = produtos.find(item => (item.id == id || item.localId == id));

                    document.getElementById('venda-prod-nome').innerText = nome;
                    document.getElementById('venda-prod-nome').dataset.prodId = id;
                    document.getElementById('venda-prod-preco').innerText = `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
                    document.getElementById('venda-prod-preco').dataset.valorRaw = preco;
                    document.getElementById('ipt-venda-cliente').value = '';

                    const hdnStatusInput = document.getElementById('ipt-venda-status');
                    if (hdnStatusInput) hdnStatusInput.value = 'Pago';
                    document.querySelectorAll('.venda-status-btn').forEach(b => {
                        if (b.getAttribute('data-val') === 'Pago') {
                            b.style.background = 'white';
                            b.style.color = '#10B981';
                            b.style.fontWeight = '700';
                            b.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        } else {
                            b.style.background = 'transparent';
                            b.style.color = '#6B7280';
                            b.style.fontWeight = '600';
                            b.style.boxShadow = 'none';
                        }
                    });
                    
                    const qtyInput = document.getElementById('ipt-venda-quantidade');
                    if (qtyInput) {
                        qtyInput.value = 1;
                        qtyInput.min = 1;
                        if (p) {
                            const maxQty = p.variacoes ? 100 : Number(p.estoque || 0);
                            qtyInput.max = maxQty;
                        }
                    }

                    const confirmBtn = document.getElementById('btn-confirmar-venda');
                    if (confirmBtn) {
                        delete confirmBtn.dataset.editSaleId;
                        delete confirmBtn.dataset.editProdId;
                        delete confirmBtn.dataset.oldVar;
                        delete confirmBtn.dataset.oldStatus;
                        delete confirmBtn.dataset.oldCliente;
                        delete confirmBtn.dataset.oldQty;
                        confirmBtn.innerHTML = 'Confirmar a Compra';
                    }

                    const selectVar = document.getElementById('ipt-venda-variacao');
                    const formGroupVar = document.getElementById('form-group-venda-variacao');
                    if (selectVar && formGroupVar) {
                        selectVar.innerHTML = '';
                        if (p && p.variacoes) {
                            const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                            if (list.length > 0) {
                                list.forEach(v => {
                                    const qty = p.variacoesStock && p.variacoesStock[v] !== undefined ? p.variacoesStock[v] : 0;
                                    const opt = document.createElement('option');
                                    opt.value = v;
                                    opt.text = `${v} (${qty > 0 ? `${qty} un` : 'Esgotado'})`;
                                    if (qty <= 0) opt.disabled = true;
                                    selectVar.appendChild(opt);
                                });
                                formGroupVar.style.display = 'block';
                            } else {
                                formGroupVar.style.display = 'none';
                            }
                        } else {
                            formGroupVar.style.display = 'none';
                        }
                    }

                    const elData = document.getElementById('ipt-venda-data');
                    if (elData) elData.value = new Date().toISOString().split('T')[0];

                    slideVenda.classList.remove('hidden-overlay');
                    setTimeout(() => slideVenda.classList.add('open'), 10);
                });
            });

            // Editar Produto
            document.querySelectorAll('.btn-edit-prod').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const p = produtos.find(item => (item.id == id || item.localId == id));
                    if (p) {
                        document.getElementById('ipt-prod-id').value = id;
                        document.getElementById('ipt-prod-nome').value = p.nome;
                        document.getElementById('ipt-prod-preco').value = parseFloat(p.preco).toFixed(2).replace('.', ',');
                        document.getElementById('ipt-prod-foto-base64').value = p.foto || '';
                        document.getElementById('ipt-prod-categoria').value = p.categoria || 'Outros';
                        document.getElementById('ipt-prod-estoque').value = p.estoque || 0;
                        document.getElementById('ipt-prod-variacoes').value = p.variacoes || '';
                        document.getElementById('foto-preview-text').innerText = p.foto ? 'Foto carregada. Clique para trocar' : 'Clique ou arraste para subir a foto';

                        slideProduto.classList.remove('hidden-overlay');
                        setTimeout(() => slideProduto.classList.add('open'), 10);
                    }
                });
            });

            // Apagar Produto
            document.querySelectorAll('.btn-del-prod').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (!confirm('Deseja excluir definitivamente este produto de sua vitrine?')) return;
                    const id = e.currentTarget.dataset.id;
                    let agendaLocal = produtos.filter(p => (p.id != id && p.localId != id));
                    localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));
                    if (supabase) {
                        supabase.from('lojinha').delete().eq('id', id).then().catch(() => { });
                    }
                    window.loadLojinha();
                });
            });
        }
    };

    window.renderLojinhaVendas = (produtos) => {
        const tbody = document.getElementById('loja-vendas-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const searchVal = (document.getElementById('loja-vendas-search') ? document.getElementById('loja-vendas-search').value : '').toLowerCase().trim();
        const salesFilter = window.currentLojaVendaFilter;

        let allSales = [];
        produtos.forEach(p => {
            if (p.vendas) {
                p.vendas.forEach(v => {
                    allSales.push({
                        ...v,
                        prodId: p.id || p.localId,
                        prodNome: p.nome,
                        prodPreco: p.preco
                    });
                });
            }
        });

        allSales.sort((a, b) => {
            const timeA = Number(a.id_venda) || 0;
            const timeB = Number(b.id_venda) || 0;
            return timeB - timeA;
        });

        const filteredSales = allSales.filter(s => {
            if (searchVal && !s.prodNome.toLowerCase().includes(searchVal) && !s.cliente.toLowerCase().includes(searchVal)) {
                return false;
            }
            if (salesFilter === 'pagas') return s.status === 'Pago';
            if (salesFilter === 'pendentes') return s.status === 'Não Pago';
            return true;
        });

        if (filteredSales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#9CA3AF;">Nenhuma venda registrada.</td></tr>`;
            return;
        }

        filteredSales.forEach(s => {
            const dataFmt = s.data_venda ? s.data_venda.split('-').reverse().join('/') : '---';
            const totalVal = Number(s.total) || (Number(s.quantidade || 1) * Number(s.prodPreco));
            const isPago = s.status === 'Pago';
            
            const badgeColor = isPago 
                ? 'background:rgba(16,185,129,0.1); color:#065F46; border-radius:6px; padding:4px 8px; font-weight:600; font-size:11px; display:inline-block;' 
                : 'background:rgba(245,158,11,0.1); color:#92400E; border-radius:6px; padding:4px 8px; font-weight:600; font-size:11px; display:inline-block;';

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600;">${s.prodNome} ${s.variacao && s.variacao !== 'Único' ? `<span style="font-size:11px; color:#6B7280;">(${s.variacao})</span>` : ''} <span style="color:#6B7280; font-weight:400; font-size:12px;">x${s.quantidade || 1}</span></td>
                    <td>${s.cliente || 'Avulso'}</td>
                    <td>${dataFmt}</td>
                    <td style="font-weight:700; color:#10B981;">R$ ${totalVal.toFixed(2).replace('.', ',')}</td>
                    <td><span style="${badgeColor} cursor:pointer;" class="loja-venda-status-badge" data-sale-id="${s.id_venda}" data-prod-id="${s.prodId}" title="Clique para alternar">${s.status}</span></td>
                    <td style="text-align:right;">
                        <button class="btn-icon btn-edit-venda" data-sale-id="${s.id_venda}" data-prod-id="${s.prodId}" style="width:28px; height:28px; border-radius:6px; background:#fff; border:1px solid #E5E7EB; cursor:pointer;" title="Editar"><i data-lucide="pencil" style="width:12px; height:12px; color:#4B5563;"></i></button>
                        <button class="btn-icon btn-del-venda" data-sale-id="${s.id_venda}" data-prod-id="${s.prodId}" style="width:28px; height:28px; border-radius:6px; background:#fff; border:1px solid #FECACA; cursor:pointer;" title="Excluir"><i data-lucide="trash-2" style="width:12px; height:12px; color:#DC2626;"></i></button>
                    </td>
                </tr>
            `;
        });

        document.querySelectorAll('.btn-edit-venda').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const saleId = e.currentTarget.dataset.saleId;
                const prodId = e.currentTarget.dataset.prodId;
                const p = produtos.find(item => (item.id === prodId || item.localId === prodId));
                if (!p || !p.vendas) return;
                const sale = p.vendas.find(v => v.id_venda === saleId);
                if (!sale) return;

                document.getElementById('venda-prod-nome').innerText = p.nome;
                document.getElementById('venda-prod-nome').dataset.prodId = p.id || p.localId;
                document.getElementById('venda-prod-preco').innerText = `R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}`;
                document.getElementById('venda-prod-preco').dataset.valorRaw = p.preco;
                document.getElementById('ipt-venda-cliente').value = sale.cliente || '';
                
                const qtyInput = document.getElementById('ipt-venda-quantidade');
                if (qtyInput) {
                    qtyInput.value = sale.quantidade || 1;
                    qtyInput.min = 1;
                    const maxQty = p.variacoes ? 100 : Number(p.estoque || 0) + Number(sale.quantidade || 0);
                    qtyInput.max = maxQty;
                }

                const selectVar = document.getElementById('ipt-venda-variacao');
                const formGroupVar = document.getElementById('form-group-venda-variacao');
                if (selectVar && formGroupVar) {
                    selectVar.innerHTML = '';
                    if (p.variacoes) {
                        const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                        if (list.length > 0) {
                            list.forEach(v => {
                                const currentQty = p.variacoesStock && p.variacoesStock[v] !== undefined ? p.variacoesStock[v] : 0;
                                const originalQty = sale.variacao === v ? Number(sale.quantidade || 0) : 0;
                                const totalAvailable = currentQty + originalQty;
                                const opt = document.createElement('option');
                                opt.value = v;
                                opt.text = `${v} (${totalAvailable > 0 ? `${totalAvailable} un` : 'Esgotado'})`;
                                if (totalAvailable <= 0) opt.disabled = true;
                                if (sale.variacao === v) opt.selected = true;
                                selectVar.appendChild(opt);
                            });
                            formGroupVar.style.display = 'block';
                        } else {
                            formGroupVar.style.display = 'none';
                        }
                    } else {
                        formGroupVar.style.display = 'none';
                    }
                }

                const toggleLayoutBtnPago = document.querySelector('#slide-over-venda BUTTON[data-val="Pago"]');
                const toggleLayoutBtnPendente = document.querySelector('#slide-over-venda BUTTON[data-val="Não Pago"]');
                const hdnStatusInput = document.getElementById('ipt-venda-status');
                if (hdnStatusInput) hdnStatusInput.value = sale.status;

                if (sale.status === 'Pago') {
                    if (toggleLayoutBtnPago) {
                        toggleLayoutBtnPago.style.background = 'white';
                        toggleLayoutBtnPago.style.color = '#10B981';
                        toggleLayoutBtnPago.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }
                    if (toggleLayoutBtnPendente) {
                        toggleLayoutBtnPendente.style.background = 'transparent';
                        toggleLayoutBtnPendente.style.color = '#6B7280';
                        toggleLayoutBtnPendente.style.boxShadow = 'none';
                    }
                } else {
                    if (toggleLayoutBtnPago) {
                        toggleLayoutBtnPago.style.background = 'transparent';
                        toggleLayoutBtnPago.style.color = '#6B7280';
                        toggleLayoutBtnPago.style.boxShadow = 'none';
                    }
                    if (toggleLayoutBtnPendente) {
                        toggleLayoutBtnPendente.style.background = 'white';
                        toggleLayoutBtnPendente.style.color = '#6B7280';
                        toggleLayoutBtnPendente.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }
                }

                const selectForma = document.getElementById('ipt-venda-forma');
                if (selectForma && sale.forma_pagamento) selectForma.value = sale.forma_pagamento;

                const confirmBtn = document.getElementById('btn-confirmar-venda');
                if (confirmBtn) {
                    confirmBtn.dataset.editSaleId = sale.id_venda;
                    confirmBtn.dataset.editProdId = p.id || p.localId;
                    confirmBtn.dataset.oldVar = sale.variacao || 'Único';
                    confirmBtn.dataset.oldQty = sale.quantidade || 1;
                    confirmBtn.dataset.oldStatus = sale.status;
                    confirmBtn.dataset.oldCliente = sale.cliente || 'Avulso';
                    confirmBtn.innerHTML = 'Salvar Alterações';
                }

                const elData = document.getElementById('ipt-venda-data');
                if (elData) elData.value = sale.data_venda || new Date().toISOString().split('T')[0];

                slideVenda.classList.remove('hidden-overlay');
                setTimeout(() => slideVenda.classList.add('open'), 10);
            });
        });

        document.querySelectorAll('.btn-del-venda').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!confirm('Deseja realmente remover esta venda? O estoque retornará ao produto e o registro financeiro correspondente será cancelado.')) return;
                const saleId = e.currentTarget.dataset.saleId;
                const prodId = e.currentTarget.dataset.prodId;
                
                let agendaLocal = JSON.parse(localStorage.getItem('movia_loja') || '[]');
                const pIndex = agendaLocal.findIndex(item => (item.id === prodId || item.localId === prodId));
                if (pIndex !== -1) {
                    const p = agendaLocal[pIndex];
                    const saleIndex = p.vendas ? p.vendas.findIndex(v => v.id_venda === saleId) : -1;
                    if (saleIndex !== -1) {
                        const sale = p.vendas[saleIndex];
                        const qtyToReturn = Number(sale.quantidade || 1);
                        const varName = sale.variacao || 'Único';

                        if (p.variacoes && varName !== 'Único') {
                            if (!p.variacoesStock) p.variacoesStock = {};
                            p.variacoesStock[varName] = (Number(p.variacoesStock[varName]) || 0) + qtyToReturn;
                        } else {
                            p.estoque = (Number(p.estoque) || 0) + qtyToReturn;
                        }

                        p.vendas.splice(saleIndex, 1);

                        let financeiroLocal = [];
                        try { financeiroLocal = JSON.parse(localStorage.getItem('movia_financeiro_v2') || '[]'); } catch (ex) { }
                        
                        const financeDescription = 'Venda Lojinha: ' + p.nome + (varName !== 'Único' ? ' (' + varName + ')' : '') + ' x' + qtyToReturn;
                        const finIndex = financeiroLocal.findIndex(f => 
                            f.descricao === financeDescription && 
                            f.pessoa === (sale.cliente || 'Avulso') && 
                            f.valor == (Number(sale.total) || (qtyToReturn * Number(p.preco)))
                        );
                        if (finIndex !== -1) {
                            financeiroLocal.splice(finIndex, 1);
                            localStorage.setItem('movia_financeiro_v2', JSON.stringify(financeiroLocal));
                        }

                        localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));
                        
                        if (supabase) {
                            supabase.from('lojinha').update({
                                estoque: p.estoque,
                                variacoesStock: p.variacoesStock,
                                vendas: p.vendas
                            }).eq('id', prodId).then().catch(() => { });
                        }

                        if (window.loadFinanceiro) window.loadFinanceiro();
                        window.loadLojinha();
                    }
                }
            });
        });

        document.querySelectorAll('.loja-venda-status-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const saleId = e.currentTarget.dataset.saleId;
                const prodId = e.currentTarget.dataset.prodId;
                
                let agendaLocal = JSON.parse(localStorage.getItem('movia_loja') || '[]');
                const p = agendaLocal.find(item => (item.id === prodId || item.localId === prodId));
                if (!p || !p.vendas) return;
                const sale = p.vendas.find(v => v.id_venda === saleId);
                if (!sale) return;

                const oldStatus = sale.status;
                const newStatus = oldStatus === 'Pago' ? 'Não Pago' : 'Pago';
                sale.status = newStatus;

                let financeiroLocal = [];
                try { financeiroLocal = JSON.parse(localStorage.getItem('movia_financeiro_v2') || '[]'); } catch (ex) { }
                const varName = sale.variacao || 'Único';
                const qty = Number(sale.quantidade || 1);
                const valTotal = Number(sale.total) || (qty * Number(p.preco));
                const financeDescription = 'Venda Lojinha: ' + p.nome + (varName !== 'Único' ? ' (' + varName + ')' : '') + ' x' + qty;

                if (newStatus === 'Pago') {
                    const transPay = {
                        id: 'venda_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        tipo: 'receita',
                        valor: valTotal,
                        descricao: financeDescription,
                        data_lancamento: sale.data_venda || new Date().toISOString().split('T')[0],
                        categoria: 'Vendas Loja',
                        pessoa: sale.cliente || 'Avulso',
                        status: 'Pago',
                        forma_pagamento: sale.forma_pagamento || 'Pix'
                    };
                    financeiroLocal.push(transPay);
                } else {
                    const findIdx = financeiroLocal.findIndex(f => 
                        f.descricao === financeDescription && 
                        f.pessoa === (sale.cliente || 'Avulso') && 
                        f.status === 'Pago'
                    );
                    if (findIdx !== -1) financeiroLocal.splice(findIdx, 1);
                }

                localStorage.setItem('movia_financeiro_v2', JSON.stringify(financeiroLocal));
                localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));
                
                if (window.loadFinanceiro) window.loadFinanceiro();
                window.loadLojinha();
            });
        });

        if (window.lucide) window.lucide.createIcons();
    };

    window.renderLojinhaEstoque = (produtos) => {
        const tbody = document.getElementById('loja-estoque-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (produtos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#9CA3AF;">Nenhum produto em estoque.</td></tr>`;
            return;
        }

        produtos.forEach(p => {
            if (p.variacoes) {
                const list = p.variacoes.split(',').map(v => v.trim()).filter(Boolean);
                list.forEach(v => {
                    const qty = p.variacoesStock && p.variacoesStock[v] !== undefined ? Number(p.variacoesStock[v]) : 0;
                    const statusText = qty === 0 ? 'Sem estoque' : (qty <= 3 ? 'Estoque Baixo' : 'Em estoque');
                    const badgeColor = qty === 0 
                        ? 'background:#FEE2E2; color:#991B1B; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;' 
                        : (qty <= 3 
                            ? 'background:#FEF3C7; color:#92400E; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;' 
                            : 'background:#F0FDF4; color:#166534; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;');

                    tbody.innerHTML += `
                        <tr>
                            <td style="font-weight:600;">${p.nome}</td>
                            <td><strong style="color:var(--purple); font-size:13px;">${v}</strong></td>
                            <td style="font-weight:700;">${qty} un</td>
                            <td><span style="${badgeColor}">${statusText}</span></td>
                            <td style="text-align:right;">
                                <button class="btn-outline btn-ajustar-estoque" data-prod-id="${p.id || p.localId}" data-var="${v}" style="height:28px; font-size:11px; padding:0 8px; font-weight:600; border-radius:6px;">Ajustar</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                const qty = Number(p.estoque || 0);
                const statusText = qty === 0 ? 'Sem estoque' : (qty <= 3 ? 'Estoque Baixo' : 'Em estoque');
                const badgeColor = qty === 0 
                    ? 'background:#FEE2E2; color:#991B1B; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;' 
                    : (qty <= 3 
                        ? 'background:#FEF3C7; color:#92400E; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;' 
                        : 'background:#F0FDF4; color:#166534; border-radius:6px; padding:3px 8px; font-weight:600; font-size:11px;');

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600;">${p.nome}</td>
                        <td><span style="color:#6B7280; font-size:12px;">Único</span></td>
                        <td style="font-weight:700;">${qty} un</td>
                        <td><span style="${badgeColor}">${statusText}</span></td>
                        <td style="text-align:right;">
                            <button class="btn-outline btn-ajustar-estoque" data-prod-id="${p.id || p.localId}" data-var="Único" style="height:28px; font-size:11px; padding:0 8px; font-weight:600; border-radius:6px;">Ajustar</button>
                        </td>
                    </tr>
                `;
            }
        });

        document.querySelectorAll('.btn-ajustar-estoque').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prodId = e.currentTarget.dataset.prodId;
                const varName = e.currentTarget.dataset.var;
                
                let agendaLocal = JSON.parse(localStorage.getItem('movia_loja') || '[]');
                const pIndex = agendaLocal.findIndex(item => (item.id === prodId || item.localId === prodId));
                if (pIndex !== -1) {
                    const p = agendaLocal[pIndex];
                    const currentQty = varName === 'Único' 
                        ? Number(p.estoque || 0) 
                        : (p.variacoesStock && p.variacoesStock[varName] !== undefined ? Number(p.variacoesStock[varName]) : 0);

                    const newValStr = prompt(`Informe a nova quantidade em estoque para o produto "${p.nome}" (Variação: ${varName}):`, currentQty);
                    if (newValStr === null) return;
                    const newVal = Number(newValStr);
                    if (isNaN(newVal) || newVal < 0) {
                        alert('Valor inválido.');
                        return;
                    }

                    if (varName === 'Único') {
                        p.estoque = newVal;
                    } else {
                        if (!p.variacoesStock) p.variacoesStock = {};
                        p.variacoesStock[varName] = newVal;
                    }

                    localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));
                    
                    if (supabase) {
                        supabase.from('lojinha').update({
                            estoque: p.estoque,
                            variacoesStock: p.variacoesStock
                        }).eq('id', prodId).then().catch(() => { });
                    }
                    window.loadLojinha();
                }
            });
        });

        if (window.lucide) window.lucide.createIcons();
    };
 
    // Fechar slideovers Lojinha
    document.querySelectorAll('.close-slide-produto').forEach(b => b.addEventListener('click', () => {
        slideProduto.classList.remove('open'); setTimeout(() => slideProduto.classList.add('hidden-overlay'), 300);
    }));
    document.querySelectorAll('.close-slide-venda').forEach(b => b.addEventListener('click', () => {
        slideVenda.classList.remove('open'); setTimeout(() => slideVenda.classList.add('hidden-overlay'), 300);
    }));

    // Upload FileReader para Foto Produto
    const iptFileProd = document.getElementById('ipt-prod-foto-file');
    if (iptFileProd) {
        iptFileProd.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    document.getElementById('ipt-prod-foto-base64').value = evt.target.result;
                    document.getElementById('foto-preview-text').innerHTML = `<span style="color:#10B981;"><i data-lucide="check-circle-2" style="width:14px; margin-right:4px;"></i> Foto Carregada</span>`;
                    if (window.lucide) window.lucide.createIcons();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Abrir Novo Produto
    const btnNovoProd = document.getElementById('btn-novo-produto');
    if (btnNovoProd) {
        btnNovoProd.addEventListener('click', () => {
            document.getElementById('ipt-prod-id').value = '';
            document.getElementById('ipt-prod-nome').value = '';
            document.getElementById('ipt-prod-preco').value = '';
            document.getElementById('ipt-prod-foto-base64').value = '';
            document.getElementById('foto-preview-text').innerText = 'Clique ou arraste para subir a foto';
            slideProduto.classList.remove('hidden-overlay');
            setTimeout(() => slideProduto.classList.add('open'), 10);
        });
    }

    // Salvar Produto
    const btnSalvarProd = document.getElementById('btn-salvar-produto');
    if (btnSalvarProd) {
        btnSalvarProd.addEventListener('click', async () => {
            const editId = document.getElementById('ipt-prod-id').value;
            const nome = document.getElementById('ipt-prod-nome').value;
            let precoStr = document.getElementById('ipt-prod-preco').value.replace(/\./g, '').replace(',', '.');
            if (!nome || !precoStr) { alert('Nome e Preço obrigatórios.'); return; }

            const fotoVal = document.getElementById('ipt-prod-foto-base64').value;
            btnSalvarProd.innerHTML = 'Salvando...';

            const categoria = document.getElementById('ipt-prod-categoria').value;
            const estoque = Number(document.getElementById('ipt-prod-estoque').value) || 0;
            const variacoes = document.getElementById('ipt-prod-variacoes').value.trim();

            let agendaLocal = [];
            try { agendaLocal = JSON.parse(localStorage.getItem('movia_loja') || '[]'); } catch (e) { }

            if (editId) {
                // Modo Edição
                agendaLocal = agendaLocal.map(p => {
                    if (p.id == editId || p.localId == editId) {
                        const updated = { 
                            ...p, 
                            nome: nome, 
                            preco: parseFloat(precoStr), 
                            foto: fotoVal,
                            categoria: categoria,
                            estoque: estoque,
                            variacoes: variacoes
                        };
                        if (variacoes !== p.variacoes) {
                            let newStock = {};
                            const list = variacoes.split(',').map(v => v.trim()).filter(Boolean);
                            list.forEach(v => {
                                if (p.variacoesStock && p.variacoesStock[v] !== undefined) {
                                    newStock[v] = p.variacoesStock[v];
                                } else {
                                    newStock[v] = estoque;
                                }
                            });
                            updated.variacoesStock = newStock;
                        }
                        return updated;
                    }
                    return p;
                });
                if (supabase) {
                    supabase.from('lojinha').update({ 
                        nome: nome, 
                        preco: parseFloat(precoStr), 
                        foto: fotoVal,
                        categoria: categoria,
                        estoque: estoque,
                        variacoes: variacoes
                    }).eq('id', editId).then().catch(() => { });
                }
            } else {
                // Modo Novo Cadastro
                let variacoesStock = {};
                if (variacoes) {
                    const list = variacoes.split(',').map(v => v.trim()).filter(Boolean);
                    list.forEach(v => {
                        variacoesStock[v] = estoque;
                    });
                }
                const payload = {
                    nome: nome,
                    preco: parseFloat(precoStr),
                    foto: fotoVal,
                    categoria: categoria,
                    estoque: estoque,
                    variacoes: variacoes,
                    variacoesStock: variacoesStock,
                    vendas: [],
                    localId: Date.now().toString()
                };
                agendaLocal.push(payload);
                if (supabase) {
                    supabase.from('lojinha').insert([{ 
                        nome: payload.nome, 
                        preco: payload.preco, 
                        foto: payload.foto,
                        categoria: payload.categoria,
                        estoque: payload.estoque,
                        variacoes: payload.variacoes,
                        variacoesStock: payload.variacoesStock,
                        vendas: []
                    }]).then().catch(() => { });
                }
            }

            localStorage.setItem('movia_loja', JSON.stringify(agendaLocal));

            slideProduto.classList.remove('open');
            setTimeout(() => slideProduto.classList.add('hidden-overlay'), 300);
            window.loadLojinha();
            btnSalvarProd.innerHTML = 'Salvar Produto';
        });
    }

    // Confirmar Venda (Integração com Financeiro e Estoque)
    const btnConfirmarVenda = document.getElementById('btn-confirmar-venda');
    if (btnConfirmarVenda) {
        btnConfirmarVenda.addEventListener('click', async () => {
            const nomeProd = document.getElementById('venda-prod-nome').innerText;
            const prodId = document.getElementById('venda-prod-nome').dataset.prodId;
            const unitPrice = parseFloat(document.getElementById('venda-prod-preco').dataset.valorRaw);
            const forma = document.getElementById('ipt-venda-forma').value;
            const cliente = document.getElementById('ipt-venda-cliente').value;
            const statusVenda = document.getElementById('ipt-venda-status').value;
            const dataVenda = document.getElementById('ipt-venda-data') ? document.getElementById('ipt-venda-data').value : new Date().toISOString().split('T')[0];
            
            const quantity = Number(document.getElementById('ipt-venda-quantidade').value) || 1;
            const selectVarEl = document.getElementById('ipt-venda-variacao');
            const selectVarGroup = document.getElementById('form-group-venda-variacao');
            const selectedVar = (selectVarEl && selectVarGroup && selectVarGroup.style.display !== 'none') ? selectVarEl.value : 'Único';

            const valorTotal = unitPrice * quantity;

            let produtos = [];
            try { produtos = JSON.parse(localStorage.getItem('movia_loja') || '[]'); } catch (e) { }

            const p = produtos.find(item => (item.id == prodId || item.localId == prodId));
            if (!p) {
                alert('Produto não localizado.');
                return;
            }

            const editSaleId = btnConfirmarVenda.dataset.editSaleId;

            // Se estiver em modo edição, reverter estoque anterior e remover registro financeiro de antes
            if (editSaleId) {
                const oldVar = btnConfirmarVenda.dataset.oldVar || 'Único';
                const oldQty = Number(btnConfirmarVenda.dataset.oldQty) || 1;
                const oldStatus = btnConfirmarVenda.dataset.oldStatus;
                const oldCliente = btnConfirmarVenda.dataset.oldCliente;

                if (p.variacoes && oldVar !== 'Único') {
                    if (!p.variacoesStock) p.variacoesStock = {};
                    p.variacoesStock[oldVar] = (Number(p.variacoesStock[oldVar]) || 0) + oldQty;
                } else {
                    p.estoque = (Number(p.estoque) || 0) + oldQty;
                }

                // Deletar do caixa antigo se estava Pago
                if (oldStatus === 'Pago') {
                    let financeiroLocal = [];
                    try { financeiroLocal = JSON.parse(localStorage.getItem('movia_financeiro_v2') || '[]'); } catch (ex) { }
                    const oldDescription = 'Venda Lojinha: ' + p.nome + (oldVar !== 'Único' ? ' (' + oldVar + ')' : '') + ' x' + oldQty;
                    const oldTotalVal = unitPrice * oldQty;
                    const oldFinIndex = financeiroLocal.findIndex(f => 
                        f.descricao === oldDescription && 
                        f.pessoa === oldCliente && 
                        f.valor == oldTotalVal
                    );
                    if (oldFinIndex !== -1) {
                        financeiroLocal.splice(oldFinIndex, 1);
                        localStorage.setItem('movia_financeiro_v2', JSON.stringify(financeiroLocal));
                    }
                }
            }

            // Validar stock disponível
            if (p.variacoes && selectedVar !== 'Único') {
                const available = p.variacoesStock && p.variacoesStock[selectedVar] !== undefined ? Number(p.variacoesStock[selectedVar]) : 0;
                if (quantity > available) {
                    alert(`Estoque insuficiente da variação "${selectedVar}". Quantidade disponível: ${available} un.`);
                    // Se em edição, recarregar para restaurar alterações
                    window.loadLojinha();
                    return;
                }
                // Decrementar estoque da variação
                p.variacoesStock[selectedVar] = available - quantity;
            } else {
                const available = Number(p.estoque || 0);
                if (quantity > available) {
                    alert(`Estoque insuficiente. Quantidade disponível: ${available} un.`);
                    window.loadLojinha();
                    return;
                }
                // Decrementar estoque único
                p.estoque = available - quantity;
            }

            btnConfirmarVenda.innerHTML = 'Cancelando...'; // Evitar clicks múltiplos

            // Registrar Venda
            if (editSaleId) {
                // Atualizar venda existente
                if (p.vendas) {
                    p.vendas = p.vendas.map(v => {
                        if (v.id_venda === editSaleId) {
                            return {
                                ...v,
                                cliente: cliente || 'Avulso',
                                variacao: selectedVar,
                                quantidade: quantity,
                                status: statusVenda,
                                data_venda: dataVenda,
                                total: valorTotal,
                                forma_pagamento: forma
                            };
                        }
                        return v;
                    });
                }
            } else {
                // Nova venda
                const novaVenda = {
                    id_venda: Date.now().toString(),
                    cliente: cliente || 'Avulso',
                    variacao: selectedVar,
                    quantidade: quantity,
                    status: statusVenda,
                    data_venda: dataVenda,
                    total: valorTotal,
                    forma_pagamento: forma
                };
                p.vendas = p.vendas ? [...p.vendas, novaVenda] : [novaVenda];
            }

            localStorage.setItem('movia_loja', JSON.stringify(produtos));

            if (supabase) {
                supabase.from('lojinha').update({
                    estoque: p.estoque,
                    variacoesStock: p.variacoesStock,
                    vendas: p.vendas
                }).eq('id', prodId).then().catch(() => { });
            }

            // Sync financeiro local v2 se Pago
            if (statusVenda === 'Pago') {
                let financeiroLocal = [];
                try { financeiroLocal = JSON.parse(localStorage.getItem('movia_financeiro_v2') || '[]'); } catch (ex) { }
                
                const financeDescription = 'Venda Lojinha: ' + p.nome + (selectedVar !== 'Único' ? ' (' + selectedVar + ')' : '') + ' x' + quantity;
                const trans = {
                    id: 'venda_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    tipo: 'receita',
                    valor: valorTotal,
                    descricao: financeDescription,
                    data_lancamento: dataVenda,
                    categoria: 'Vendas Loja',
                    pessoa: cliente || 'Avulso',
                    status: 'Pago',
                    forma_pagamento: forma
                };
                financeiroLocal.push(trans);
                localStorage.setItem('movia_financeiro_v2', JSON.stringify(financeiroLocal));
                
                if (supabase) {
                    supabase.from('financeiro').insert([trans]).then().catch(() => { });
                }
            }

            slideVenda.classList.remove('open');
            setTimeout(() => slideVenda.classList.add('hidden-overlay'), 300);

            if (window.loadFinanceiro) window.loadFinanceiro();
            window.loadLojinha();

            btnConfirmarVenda.innerHTML = 'Confirmar a Compra';
            delete btnConfirmarVenda.dataset.editSaleId;
            delete btnConfirmarVenda.dataset.editProdId;
            delete btnConfirmarVenda.dataset.oldVar;
            delete btnConfirmarVenda.dataset.oldStatus;
            delete btnConfirmarVenda.dataset.oldCliente;
            delete btnConfirmarVenda.dataset.oldQty;
        });
    }

    const vendaStatusBtns = document.querySelectorAll('.venda-status-btn');
    const iptVendaStatus = document.getElementById('ipt-venda-status');
    if (vendaStatusBtns && iptVendaStatus) {
        vendaStatusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                vendaStatusBtns.forEach(b => {
                    b.style.background = 'transparent';
                    b.style.boxShadow = 'none';
                    b.style.color = '#6B7280';
                    b.style.fontWeight = '600';
                });
                const tgt = e.currentTarget;
                tgt.style.background = 'white';
                tgt.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                tgt.style.fontWeight = '700';

                const val = tgt.getAttribute('data-val');
                iptVendaStatus.value = val;

                if (val === 'Pago') {
                    tgt.style.color = '#10B981';
                } else {
                    tgt.style.color = '#EF4444';
                }
            });
        });
    }

    // --- Lógica do Prontuário Médico Digital ---
    let currentProntuarioPaciente = null;

    window.loadProntuarios = async () => {
        let prontuarios = [];
        try { prontuarios = JSON.parse(localStorage.getItem('movia_prontuario') || '[]'); } catch (e) { }

        let pacientesList = [];
        if (supabase) {
            try {
                const { data } = await supabase.from('alunos').select('nome,telefone,cpf,id');
                if (data) pacientesList = data;
            } catch (e) { }
        }
        if (pacientesList.length === 0) {
            const nomes = [...new Set(prontuarios.map(p => p.paciente).filter(Boolean))];
            pacientesList = nomes.map(n => ({ nome: n }));
        }

        const sidebarLista = document.getElementById('lista-pacientes-prontuario-sidebar');
        if (sidebarLista) {
            sidebarLista.innerHTML = '';
            if (pacientesList.length === 0) {
                sidebarLista.innerHTML = '<div style="padding:1rem; text-align:center; color:#9CA3AF; font-size:0.85rem;">Nenhum aluno cadastrado.</div>';
            } else {
                pacientesList.forEach(pac => {
                    const div = document.createElement('div');
                    div.style.cssText = 'padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; display:flex; align-items:center; gap:10px; transition: background 0.2s;';
                    div.innerHTML = `
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(pac.nome)}&background=2563EB&color=fff&size=32" style="width:32px; height:32px; border-radius:8px; object-fit:cover;">
                        <span style="font-size:0.9rem; font-weight:600; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${pac.nome}</span>
                    `;
                    div.onmouseover = () => div.style.background = '#F3F4F6';
                    div.onmouseleave = () => { if (currentProntuarioPaciente !== pac.nome) div.style.background = 'transparent'; };
                    div.onclick = () => {
                        Array.from(sidebarLista.children).forEach(c => c.style.background = 'transparent');
                        div.style.background = '#F3F4F6';
                        window.abrirProntuarioPaciente(pac, prontuarios);
                    };
                    sidebarLista.appendChild(div);
                });
            }
        }
    };

    window.abrirProntuarioPaciente = (pac, prontuarios) => {
        currentProntuarioPaciente = pac.nome;
        document.getElementById('prontuario-vazio-state').style.display = 'none';
        document.getElementById('prontuario-selecionado-content').style.display = 'flex';

        document.getElementById('pront-header-nome').innerText = pac.nome;
        document.getElementById('pront-header-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pac.nome)}&background=2563EB&color=fff&size=64`;
        document.getElementById('pront-header-tel').innerText = pac.telefone || 'Não informado';
        document.getElementById('pront-header-cpf').innerText = pac.cpf || 'Não informado';

        // Render timeline
        const container = document.getElementById('prontuario-timeline-container');
        if (container) {
            container.innerHTML = '';

            const meusRegistros = prontuarios.filter(p => p.paciente === pac.nome).sort((a, b) => new Date(b.data) - new Date(a.data));

            if (meusRegistros.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9CA3AF; font-size:0.9rem;">Nenhum registro clínico encontrado para este paciente.</div>';
            } else {
                meusRegistros.forEach(reg => {
                    const parts = reg.data.split('-');
                    const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : reg.data;
                    const node = document.createElement('div');
                    node.className = 'timeline-item';
                    node.style.animation = "fadeIn 0.3s ease-out";
                    node.innerHTML = `
                        <div class="time">${shortDate}</div>
                        <div class="timeline-box" style="padding: 1.25rem 1.5rem; background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 0.75rem;">
                            
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <div style="font-weight:800; color:var(--dark); font-size:1.05rem; letter-spacing:-0.01em;">${reg.titulo}</div>
                                    <div style="font-size:0.75rem; color:#64748B; font-weight:600; display:flex; align-items:center; gap:6px; margin-top:4px;">
                                        <div style="width:6px; height:6px; border-radius:50%; background:#10B981;"></div>
                                        Registrado em Sistema
                                    </div>
                                </div>
                                <div style="display:flex; gap: 0.25rem;">
                                    <button class="btn-icon" title="Editar" style="width:28px; height:28px; color:#94A3B8;" onclick="window.editarEvolucao('${reg.localId}')"><i data-lucide="edit-3" style="width:14px;"></i></button>
                                    <button class="btn-icon" title="Imprimir Receituário" style="width:28px; height:28px; color:#94A3B8;"><i data-lucide="printer" style="width:14px;"></i></button>
                                </div>
                            </div>
                            
                            <div style="font-size:0.9rem; color:var(--text-primary); line-height:1.6; white-space:pre-wrap; margin-bottom: ${reg.imagem ? '12px' : '0'}; background: #F8FAFC; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary);">${reg.texto}</div>
                            
                            ${reg.imagem ? `<div style="margin-top:0.5rem;"><img src="${reg.imagem}" style="width: 100%; max-width: 400px; border-radius: 12px; border: 2px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);"></div>` : ''}
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px dashed #E2E8F0;">
                                <div style="display:flex; align-items:center; gap: 8px;">
                                    <img src="https://ui-avatars.com/api/?name=Dr+Clinica&background=475569&color=fff&size=24" style="width:24px; height:24px; border-radius:50%;">
                                    <span style="font-size:0.75rem; color:#64748B; font-weight:600;">Assinado por Dr. ${JSON.parse(localStorage.getItem('movia_signup_data') || '{}').name || 'Usuário'}</span>
                                </div>
                                <span style="font-size:0.7rem; color:#CBD5E1; font-weight:600;">ID: #${reg.localId.slice(-6)}</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(node);
                });
            }
        }
    };

    const btnNovoPront = document.getElementById('btn-novo-prontuario');
    const btnAddLinha = document.getElementById('btn-add-linha-prontuario');
    const iptInlineTitulo = document.getElementById('ipt-pront-inline-titulo');
    const iptInlineTexto = document.getElementById('ipt-pront-inline-texto');
    const btnSalvarInline = document.getElementById('btn-salvar-pront-inline');
    const txtDataHoje = document.getElementById('txt-data-hoje');

    window.editingEvolucaoId = null;
    window.editarEvolucao = (id) => {
        let prontuarios = [];
        try { prontuarios = JSON.parse(localStorage.getItem('movia_prontuario') || '[]'); } catch (e) { }
        const reg = prontuarios.find(p => p.localId === id);
        if (reg) {
            iptInlineTitulo.value = reg.titulo;
            iptInlineTexto.value = reg.texto;
            if (reg.imagem) {
                document.getElementById('ipt-pront-anexo-base64').value = reg.imagem;
                document.getElementById('pront-anexo-img').src = reg.imagem;
                document.getElementById('pront-anexo-preview').style.display = 'block';
            } else {
                window.removerAnexoInline();
            }
            window.editingEvolucaoId = id;
            btnSalvarInline.innerHTML = 'Salvar Edição';
            btnSalvarInline.style.background = '#F59E0B';

            const contEvo = document.getElementById('pront-content-evolucao');
            if (contEvo) contEvo.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (txtDataHoje) {
        const h = new Date();
        txtDataHoje.innerText = h.toLocaleDateString('pt-BR');
    }

    const focarInputInline = () => {
        if (!currentProntuarioPaciente) {
            alert('Por favor, selecione um paciente primeiro na lista lateral.');
            return;
        }
        if (iptInlineTitulo) {
            iptInlineTitulo.focus();
            // Muda p/ aba de evolução se não estiver
            changeProntTab('evolucao');
        }
    };

    if (btnNovoPront) btnNovoPront.addEventListener('click', focarInputInline);
    if (btnAddLinha) btnAddLinha.addEventListener('click', focarInputInline);

    // Sistema de Abas (Tabs) do Prontuário
    const prontTabs = document.querySelectorAll('.pront-tab');

    function changeProntTab(tabId) {
        prontTabs.forEach(t => {
            if (t.dataset.tab === tabId) {
                t.classList.add('active');
                t.style.borderBottomColor = 'var(--primary)';
                t.style.color = 'var(--primary)';
                t.style.fontWeight = '700';
            } else {
                t.classList.remove('active');
                t.style.borderBottomColor = 'transparent';
                t.style.color = '#64748B';
                t.style.fontWeight = '600';
            }
        });
        document.querySelectorAll('.pront-content').forEach(c => {
            if (c.id === 'pront-content-' + tabId) c.style.display = 'flex';
            else c.style.display = 'none';
        });
    }

    prontTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            changeProntTab(tab.dataset.tab);
        });
    });

    if (btnSalvarInline) {
        btnSalvarInline.addEventListener('click', () => {
            if (!currentProntuarioPaciente) return;

            const titulo = iptInlineTitulo.value;
            const texto = iptInlineTexto.value;

            if (!titulo || !texto) { alert('Título e Anotações são obrigatórios.'); return; }

            btnSalvarInline.innerHTML = 'Salvando...';

            let prontuarios = [];
            try { prontuarios = JSON.parse(localStorage.getItem('movia_prontuario') || '[]'); } catch (e) { }

            const base64Img = document.getElementById('ipt-pront-anexo-base64').value;

            if (window.editingEvolucaoId) {
                const idx = prontuarios.findIndex(p => p.localId === window.editingEvolucaoId);
                if (idx > -1) {
                    prontuarios[idx].titulo = titulo;
                    prontuarios[idx].texto = texto;
                    prontuarios[idx].imagem = base64Img || null;
                }
                window.editingEvolucaoId = null;
            } else {
                prontuarios.push({
                    localId: Date.now().toString(),
                    titulo,
                    paciente: currentProntuarioPaciente,
                    data: new Date().toISOString().split('T')[0],
                    texto,
                    imagem: base64Img || null
                });
            }

            localStorage.setItem('movia_prontuario', JSON.stringify(prontuarios));

            iptInlineTitulo.value = '';
            iptInlineTexto.value = '';
            removerAnexoInline();

            window.loadProntuarios().then(() => {
                const latest = JSON.parse(localStorage.getItem('movia_prontuario') || '[]');
                window.abrirProntuarioPaciente({ nome: currentProntuarioPaciente, telefone: document.getElementById('pront-header-tel').innerText, cpf: document.getElementById('pront-header-cpf').innerText }, latest);
            });
            btnSalvarInline.innerHTML = 'Registrar Evolução';
            btnSalvarInline.style.background = '';
        });
    }

    // ----------------------------------------------------
    // LÓGICA DE ANEXAR IMAGEM INLINE
    // ----------------------------------------------------
    const btnAnexo = document.getElementById('btn-pront-anexo');
    const iptAnexoFile = document.getElementById('ipt-pront-anexo-file');
    const previewContainer = document.getElementById('pront-anexo-preview');
    const previewImg = document.getElementById('pront-anexo-img');
    const iptBase64 = document.getElementById('ipt-pront-anexo-base64');
    const btnRemoveAnexo = document.getElementById('btn-pront-anexo-remove');

    if (btnAnexo && iptAnexoFile) {
        btnAnexo.addEventListener('click', () => iptAnexoFile.click());

        iptAnexoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    iptBase64.value = reader.result;
                    previewImg.src = reader.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const removerAnexoInline = () => {
        if (iptBase64) iptBase64.value = '';
        if (iptAnexoFile) iptAnexoFile.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
    };

    if (btnRemoveAnexo) {
        btnRemoveAnexo.addEventListener('click', removerAnexoInline);
    }

    // ----------------------------------------------------
    // LÓGICA DE MICROFONE (SPEECH TO TEXT)
    // ----------------------------------------------------
    const btnMic = document.getElementById('btn-pront-mic');
    const txtMicStatus = document.getElementById('txt-pront-mic-status');
    let isRecording = false;
    let recognition = null;

    if (btnMic && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            btnMic.style.color = 'var(--danger)';
            btnMic.style.borderColor = 'var(--danger)';
            txtMicStatus.style.display = 'inline-block';
        };

        recognition.onresult = (event) => {
            const resultText = event.results[0][0].transcript;
            const iptTxt = document.getElementById('ipt-pront-inline-texto');
            if (iptTxt) {
                iptTxt.value = iptTxt.value + (iptTxt.value ? ' ' : '') + resultText;
            }
        };

        recognition.onerror = (event) => {
            console.error('Erro no ditado: ', event.error);
            pararGravacao();
        };

        recognition.onend = () => {
            pararGravacao();
        };

        btnMic.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else if (btnMic) {
        btnMic.title = 'Ditado não suportado neste navegador';
        btnMic.style.opacity = '0.5';
    }

    const pararGravacao = () => {
        isRecording = false;
        if (btnMic) {
            btnMic.style.color = '#475569';
            btnMic.style.borderColor = 'transparent';
        }
        if (txtMicStatus) txtMicStatus.style.display = 'none';
    };

    // ----------------------------------------------------
    // LÓGICA DE TIPO SANGUÍNEO (Auto-save)
    // ----------------------------------------------------
    const selSangue = document.getElementById('ipt-pront-sangue');
    if (selSangue) {
        selSangue.addEventListener('change', (e) => {
            if (!currentProntuarioPaciente) return;
            const val = e.target.value;
            let info = null;
            try { info = JSON.parse(localStorage.getItem('movia_pacientes_info')) || {}; } catch (err) { }
            if (!info) info = {};
            if (!info[currentProntuarioPaciente]) info[currentProntuarioPaciente] = {};
            info[currentProntuarioPaciente].sangue = val;
            localStorage.setItem('movia_pacientes_info', JSON.stringify(info));
        });
    }

    const carregarInfoBasicaPaciente = (nomePac) => {
        try {
            const info = JSON.parse(localStorage.getItem('movia_pacientes_info')) || {};
            const pacInfo = info[nomePac] || {};
            if (selSangue) selSangue.value = pacInfo.sangue || 'ND';
        } catch (e) { }
    };

    // ----------------------------------------------------
    // LÓGICA DO RELATÓRIO CLÍNICO GERAL
    // ----------------------------------------------------
    const btnSalvarRelatorio = document.getElementById('btn-salvar-relatorio-geral');
    if (btnSalvarRelatorio) {
        btnSalvarRelatorio.addEventListener('click', () => {
            if (!currentProntuarioPaciente) return;
            const relatorioTexto = document.getElementById('ipt-pront-relatorio').value;

            let data = {};
            try { data = JSON.parse(localStorage.getItem('movia_relatorios_clinicos')) || {}; } catch (e) { }
            data[currentProntuarioPaciente] = relatorioTexto;
            localStorage.setItem('movia_relatorios_clinicos', JSON.stringify(data));

            btnSalvarRelatorio.innerHTML = '<i data-lucide="check" style="width:14px; margin-right:4px;"></i> Salvo!';
            btnSalvarRelatorio.style.background = '#10B981';
            lucide.createIcons();

            setTimeout(() => {
                btnSalvarRelatorio.innerHTML = '<i data-lucide="save" style="width:14px; margin-right:4px;"></i> Salvar Relatório';
                btnSalvarRelatorio.style.background = '';
                lucide.createIcons();
            }, 2000);
        });
    }

    const carregarRelatorioClinico = (nomePac) => {
        try {
            const data = JSON.parse(localStorage.getItem('movia_relatorios_clinicos')) || {};
            if (document.getElementById('ipt-pront-relatorio')) {
                document.getElementById('ipt-pront-relatorio').value = data[nomePac] || '';
            }
        } catch (e) { }
    };

    // Sobrescrevendo parcialmente a função abrirProntuarioPaciente para injetar as chamas de load extra
    const _abrirProntuarioOriginal = window.abrirProntuarioPaciente;
    window.abrirProntuarioPaciente = (pac, prontuarios) => {
        _abrirProntuarioOriginal(pac, prontuarios);
        carregarInfoBasicaPaciente(pac.nome);
        carregarRelatorioClinico(pac.nome);
        carregarAnamnesePaciente(pac.nome);
        carregarArquivosPaciente(pac.nome);
    };

    // ----------------------------------------------------
    // LÓGICA DE ANAMNESE
    // ----------------------------------------------------
    const btnSalvarAnamnese = document.getElementById('btn-salvar-anamnese');
    if (btnSalvarAnamnese) {
        btnSalvarAnamnese.addEventListener('click', () => {
            if (!currentProntuarioPaciente) return;

            const obj = {
                queixa: document.getElementById('anamnese-queixa').value,
                doencas: document.getElementById('anamnese-doencas').value,
                medicamentos: document.getElementById('anamnese-medicamentos').value,
                historico: document.getElementById('anamnese-historico').value,
                alergias: document.getElementById('anamnese-alergias') ? document.getElementById('anamnese-alergias').value : '',
                cirurgias: document.getElementById('anamnese-cirurgias') ? document.getElementById('anamnese-cirurgias').value : '',
                habitos: document.getElementById('anamnese-habitos') ? document.getElementById('anamnese-habitos').value : ''
            };

            let data = {};
            try { data = JSON.parse(localStorage.getItem('movia_anamneses')) || {}; } catch (e) { }
            data[currentProntuarioPaciente] = obj;
            localStorage.setItem('movia_anamneses', JSON.stringify(data));

            const txtBase = btnSalvarAnamnese.innerText;
            btnSalvarAnamnese.innerHTML = '<i class="lucide lucide-check" style="width:14px; margin-right:4px;"></i> Salvo!';
            btnSalvarAnamnese.style.background = '#10B981';
            setTimeout(() => {
                btnSalvarAnamnese.innerHTML = '<i class="lucide lucide-save" style="width:14px; margin-right:4px;"></i> Salvar Anamnese';
                btnSalvarAnamnese.style.background = 'var(--primary)';
                lucide.createIcons();
            }, 2000);
        });
    }

    const carregarAnamnesePaciente = (nomePac) => {
        try {
            const data = JSON.parse(localStorage.getItem('movia_anamneses')) || {};
            const obj = data[nomePac] || { queixa: '', doencas: '', medicamentos: '', historico: '', alergias: '', cirurgias: '', habitos: '' };
            if (document.getElementById('anamnese-queixa')) {
                document.getElementById('anamnese-queixa').value = obj.queixa || '';
                document.getElementById('anamnese-doencas').value = obj.doencas || '';
                document.getElementById('anamnese-medicamentos').value = obj.medicamentos || '';
                document.getElementById('anamnese-historico').value = obj.historico || '';
                if (document.getElementById('anamnese-alergias')) document.getElementById('anamnese-alergias').value = obj.alergias || '';
                if (document.getElementById('anamnese-cirurgias')) document.getElementById('anamnese-cirurgias').value = obj.cirurgias || '';
                if (document.getElementById('anamnese-habitos')) document.getElementById('anamnese-habitos').value = obj.habitos || '';
            }
        } catch (e) { }
    };

    // ----------------------------------------------------
    // LÓGICA DE ARQUIVOS (Simulada no LocalStorage para demonstração)
    // ----------------------------------------------------
    const btnUploadDoc = document.getElementById('btn-trigger-upload-doc');
    const iptUploadDoc = document.getElementById('ipt-upload-documento');
    const listaArquivos = document.getElementById('lista-arquivos-paciente');

    if (btnUploadDoc && iptUploadDoc) {
        btnUploadDoc.addEventListener('click', () => iptUploadDoc.click());

        iptUploadDoc.addEventListener('change', async (e) => {
            if (!currentProntuarioPaciente) return;
            const files = e.target.files;
            if (files && files.length > 0) {
                let currentDocs = [];
                try {
                    const allDocs = JSON.parse(localStorage.getItem('movia_arquivos_pacientes')) || {};
                    currentDocs = allDocs[currentProntuarioPaciente] || [];
                } catch (e) { }

                // Em um cenário real, enviaríamos ao Supabase Storage.
                // Simulando salvamento de nome, tamanho e base64.
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const base64Data = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target.result);
                        reader.readAsDataURL(file);
                    });

                    currentDocs.push({
                        id: Date.now() + i,
                        nome: file.name,
                        tamanho: (file.size / 1024).toFixed(1) + ' KB',
                        dataStr: new Date().toLocaleDateString('pt-BR'),
                        base64: base64Data
                    });
                }

                const allDocs = JSON.parse(localStorage.getItem('movia_arquivos_pacientes') || '{}');
                allDocs[currentProntuarioPaciente] = currentDocs;
                localStorage.setItem('movia_arquivos_pacientes', JSON.stringify(allDocs));

                iptUploadDoc.value = '';
                carregarArquivosPaciente(currentProntuarioPaciente);
            }
        });
    }

    window.mostrarVisualizadorArquivo = (doc) => {
        const viewerModal = document.getElementById('modal-viewer-arquivo');
        const viewerContent = document.getElementById('viewer-content');
        const viewerTitle = document.getElementById('viewer-title');

        if (viewerModal && viewerContent && viewerTitle) {
            viewerTitle.innerText = doc.nome;

            const extensao = doc.nome.toLowerCase();
            const ehImagem = extensao.endsWith('.png') || extensao.endsWith('.jpg') || extensao.endsWith('.jpeg') || extensao.endsWith('.webp') || extensao.endsWith('.gif') || extensao.endsWith('.svg') || (doc.base64 && doc.base64.startsWith('data:image/'));

            if (ehImagem && doc.base64) {
                viewerContent.innerHTML = `<img src="${doc.base64}" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
            } else if (doc.base64) {
                viewerContent.innerHTML = `
                    <div style="text-align:center; padding: 2rem; display:flex; flex-direction:column; align-items:center; gap:12px;">
                        <i class="lucide lucide-file-text" style="width:64px; height:64px; color:var(--primary);"></i>
                        <p style="font-weight:600; color:var(--dark);">Visualização não disponível para este tipo de documento.</p>
                        <a href="${doc.base64}" download="${doc.nome}" class="btn-primary" style="text-decoration:none; padding:8px 16px; font-size:0.85rem; border-radius:8px; color:white; background:var(--primary); font-weight:600;">Fazer Download</a>
                    </div>
                `;
            } else {
                viewerContent.innerHTML = `
                    <div style="text-align:center; padding: 2rem;">
                        <p style="font-weight:600; color:var(--dark);">Arquivo sem dados de mídia disponíveis.</p>
                    </div>
                `;
            }

            viewerModal.style.display = 'flex';
            lucide.createIcons();
        }
    };

    const carregarArquivosPaciente = (nomePac) => {
        if (!listaArquivos) return;
        listaArquivos.innerHTML = '';
        try {
            const allDocs = JSON.parse(localStorage.getItem('movia_arquivos_pacientes')) || {};
            const docs = allDocs[nomePac] || [];
            if (docs.length === 0) {
                listaArquivos.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #9CA3AF; font-size:0.9rem;">Nenhum arquivo anexado.</div>';
                return;
            }
            docs.forEach(doc => {
                const card = document.createElement('div');
                card.style.cssText = 'background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; display:flex; flex-direction:column; gap:0.5rem; cursor:pointer; transition:all 0.2s;';
                card.onmouseover = () => { card.style.borderColor = 'var(--primary)'; card.style.transform = 'translateY(-2px)'; };
                card.onmouseout = () => { card.style.borderColor = '#E2E8F0'; card.style.transform = 'translateY(0)'; };

                card.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    mostrarVisualizadorArquivo(doc);
                };

                let thumbnailHTML = `
                    <div style="width:100%; height:120px; background:#F8FAFC; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#64748B; border: 1px dashed #CBD5E1; overflow:hidden;">
                        <i class="lucide lucide-file-text" style="width:32px; height:32px;"></i>
                    </div>
                `;

                const extensao = doc.nome.toLowerCase();
                const ehImagem = extensao.endsWith('.png') || extensao.endsWith('.jpg') || extensao.endsWith('.jpeg') || extensao.endsWith('.webp') || extensao.endsWith('.gif') || extensao.endsWith('.svg') || (doc.base64 && doc.base64.startsWith('data:image/'));

                if (ehImagem && doc.base64) {
                    thumbnailHTML = `
                        <div style="width:100%; height:120px; background:#F1F5F9; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; border: 1px solid #E2E8F0;">
                            <img src="${doc.base64}" style="width:100%; height:100%; object-fit:cover;" />
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        ${thumbnailHTML}
                        <button onclick="event.stopPropagation(); removerArquivoPaciente('${nomePac}', ${doc.id})" title="Excluir arquivo" style="background:transparent; border:none; cursor:pointer; color:#94A3B8; padding:4px; margin-left:8px;"><i class="lucide lucide-trash-2" style="width:16px;"></i></button>
                    </div>
                    <div style="margin-top:6px;">
                        <h5 style="font-size:0.85rem; font-weight:700; color:var(--dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${doc.nome}">${doc.nome}</h5>
                        <p style="font-size:0.75rem; color:#64748B; margin-top:2px;">${doc.dataStr} • ${doc.tamanho}</p>
                    </div>
                `;
                listaArquivos.appendChild(card);
            });
            lucide.createIcons();
        } catch (e) { }
    };

    window.removerArquivoPaciente = (nomePac, docId) => {
        if (confirm('Tem certeza que deseja remover este arquivo?')) {
            const allDocs = JSON.parse(localStorage.getItem('movia_arquivos_pacientes')) || {};
            if (allDocs[nomePac]) {
                allDocs[nomePac] = allDocs[nomePac].filter(d => d.id !== docId);
                localStorage.setItem('movia_arquivos_pacientes', JSON.stringify(allDocs));
                carregarArquivosPaciente(nomePac);
            }
        }
    };

    // Buscador do prontuario
    const iptBuscaPront = document.getElementById('busca-paciente-pront');
    if (iptBuscaPront) {
        iptBuscaPront.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const items = document.getElementById('lista-pacientes-prontuario-sidebar').children;
            Array.from(items).forEach(child => {
                if (child.innerText.toLowerCase().includes(termo)) child.style.display = 'flex';
                else child.style.display = 'none';
            });
        });
    }

    // --- Lógica do Módulo Integrações ---
    const initIntegrations = () => {
        const wellhubSettings = JSON.parse(localStorage.getItem('movia_wellhub_settings') || '{"active":false}');
        const totalpassSettings = JSON.parse(localStorage.getItem('movia_totalpass_settings') || '{"active":false}');
        const instagramSettings = JSON.parse(localStorage.getItem('movia_instagram_settings') || '{"active":false}');

        const chkWellhubActive = document.getElementById('chk-wellhub-active');
        const chkTotalpassActive = document.getElementById('chk-totalpass-active');
        const chkInstagramActive = document.getElementById('chk-instagram-sync');

        const btnSaveWellhub = document.getElementById('btn-save-wellhub');
        const btnSaveTotalpass = document.getElementById('btn-save-totalpass');
        const btnSaveInstagram = document.getElementById('btn-save-instagram');
        const wellhubStatusBadge = document.getElementById('wellhub-status-badge');
        const totalpassStatusBadge = document.getElementById('totalpass-status-badge');

        const updateWellhubVisuals = (active) => {
            const logsDiv = document.getElementById('wellhub-logs');
            if (!logsDiv) return;

            if (active) {
                if (wellhubStatusBadge) {
                    wellhubStatusBadge.innerText = 'Conectado';
                    wellhubStatusBadge.style.background = '#10B981';
                }
                if (chkWellhubActive) chkWellhubActive.checked = true;
                logsDiv.innerHTML = `
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size: 0.8rem;">
                        <span>Lucas Santos (Check-in #7729)</span>
                        <span style="color:#10B981; font-weight:600;">Validado hoje, 08:15h</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size: 0.8rem;">
                        <span>Amanda Souza (Check-in #6512)</span>
                        <span style="color:#10B981; font-weight:600;">Validado ontem, 19:00h</span>
                    </div>
                `;
            } else {
                if (wellhubStatusBadge) {
                    wellhubStatusBadge.innerText = 'Desconectado';
                    wellhubStatusBadge.style.background = '#6B7280';
                }
                if (chkWellhubActive) chkWellhubActive.checked = false;
                logsDiv.innerHTML = '<div style="text-align:center; padding:1.5rem 0;">Sincronização desativada.</div>';
            }
        };

        const updateTotalpassVisuals = (active) => {
            const logsDiv = document.getElementById('totalpass-logs');
            if (!logsDiv) return;

            if (active) {
                if (totalpassStatusBadge) {
                    totalpassStatusBadge.innerText = 'Conectado';
                    totalpassStatusBadge.style.background = '#10B981';
                }
                if (chkTotalpassActive) chkTotalpassActive.checked = true;
                logsDiv.innerHTML = `
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size: 0.8rem;">
                        <span>Bruno Lima (Passe #9901)</span>
                        <span style="color:#10B981; font-weight:600;">Validado hoje, 09:30h</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size: 0.8rem;">
                        <span>Clara Costa (Passe #8832)</span>
                        <span style="color:#10B981; font-weight:600;">Validado ontem, 17:10h</span>
                    </div>
                `;
            } else {
                if (totalpassStatusBadge) {
                    totalpassStatusBadge.innerText = 'Desconectado';
                    totalpassStatusBadge.style.background = '#6B7280';
                }
                if (chkTotalpassActive) chkTotalpassActive.checked = false;
                logsDiv.innerHTML = '<div style="text-align:center; padding:1.5rem 0;">Sincronização desativada.</div>';
            }
        };

        // Carregar dados salvos (declarações foram movidas para o topo de initIntegrations)
        const iptWellhubId = document.getElementById('ipt-wellhub-id');
        const iptWellhubToken = document.getElementById('ipt-wellhub-token');
        const iptTotalpassId = document.getElementById('ipt-totalpass-id');
        const iptTotalpassToken = document.getElementById('ipt-totalpass-token');
        const iptInstagramToken = document.getElementById('ipt-instagram-token');
        const iptInstagramPageId = document.getElementById('ipt-instagram-page-id');

        if (iptWellhubId) iptWellhubId.value = wellhubSettings.id || '';
        if (iptWellhubToken) iptWellhubToken.value = wellhubSettings.token || '';
        if (chkWellhubActive) updateWellhubVisuals(wellhubSettings.active);

        if (iptTotalpassId) iptTotalpassId.value = totalpassSettings.id || '';
        if (iptTotalpassToken) iptTotalpassToken.value = totalpassSettings.token || '';
        if (chkTotalpassActive) updateTotalpassVisuals(totalpassSettings.active);

        if (iptInstagramToken) iptInstagramToken.value = instagramSettings.token || '';
        if (iptInstagramPageId) iptInstagramPageId.value = instagramSettings.pageId || '';

        const updateInstagramVisuals = (active) => {
            const logsDiv = document.getElementById('instagram-logs');
            if (!logsDiv) return;
            if (active) {
                if (chkInstagramActive) chkInstagramActive.checked = true;
                logsDiv.innerHTML = `
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #E2E8F0; font-size: 0.8rem;">
                        <span>Conectado (Aguardando Webhook)</span>
                        <span style="color:#ec4899; font-weight:600;">Ouvindo mensagens...</span>
                    </div>`;
            } else {
                if (chkInstagramActive) chkInstagramActive.checked = false;
                logsDiv.innerHTML = '<div style="text-align:center; padding:1.5rem 0;">Aguardando token de acesso oficial...</div>';
            }
        };
        updateInstagramVisuals(instagramSettings.active);

        if (btnSaveWellhub) {
            btnSaveWellhub.addEventListener('click', () => {
                const idVal = iptWellhubId ? iptWellhubId.value : '';
                const tokenVal = iptWellhubToken ? iptWellhubToken.value : '';
                const activeVal = chkWellhubActive ? chkWellhubActive.checked : false;

                if (activeVal && (!idVal || !tokenVal)) {
                    alert('Por favor, insira o ID e o Token da API do Wellhub para ativar a sincronização.');
                    if (chkWellhubActive) chkWellhubActive.checked = false;
                    return;
                }

                localStorage.setItem('movia_wellhub_settings', JSON.stringify({
                    active: activeVal,
                    id: idVal,
                    token: tokenVal
                }));

                updateWellhubVisuals(activeVal);
                alert('Configurações do Wellhub salvas com sucesso!');
            });
        }

        if (btnSaveTotalpass) {
            btnSaveTotalpass.addEventListener('click', () => {
                const idVal = iptTotalpassId ? iptTotalpassId.value : '';
                const tokenVal = iptTotalpassToken ? iptTotalpassToken.value : '';
                const activeVal = chkTotalpassActive ? chkTotalpassActive.checked : false;

                if (activeVal && (!idVal || !tokenVal)) {
                    alert('Por favor, insira o ID da Filial e o Token da API do TotalPass para ativar a sincronização.');
                    if (chkTotalpassActive) chkTotalpassActive.checked = false;
                    return;
                }

                localStorage.setItem('movia_totalpass_settings', JSON.stringify({
                    active: activeVal,
                    id: idVal,
                    token: tokenVal
                }));

                updateTotalpassVisuals(activeVal);
                alert('Configurações do TotalPass salvas com sucesso!');
            });
        }

        if (btnSaveInstagram) {
            btnSaveInstagram.addEventListener('click', () => {
                const idVal = iptInstagramPageId ? iptInstagramPageId.value : '';
                const tokenVal = iptInstagramToken ? iptInstagramToken.value : '';
                const activeVal = chkInstagramActive ? chkInstagramActive.checked : false;

                if (activeVal && (!idVal || !tokenVal)) {
                    alert('Por favor, insira a Página ID e o Token de Acesso da Meta para ativar a sincronização do Instagram.');
                    if (chkInstagramActive) chkInstagramActive.checked = false;
                    return;
                }

                localStorage.setItem('movia_instagram_settings', JSON.stringify({
                    active: activeVal,
                    pageId: idVal,
                    token: tokenVal
                }));

                updateInstagramVisuals(activeVal);
                alert('Configurações do Instagram salvas com sucesso!');
            });
        }

        if (chkWellhubActive) {
            chkWellhubActive.addEventListener('change', () => {
                updateWellhubVisuals(chkWellhubActive.checked);
            });
        }
        if (chkTotalpassActive) {
            chkTotalpassActive.addEventListener('change', () => {
                updateTotalpassVisuals(chkTotalpassActive.checked);
            });
        }
    };

    // Inicializa módulo de integrações
    initIntegrations();

    // Sincroniza clique do menu lateral tradicional
    document.querySelectorAll('.sidebar-fixed .nav-item[data-target], .sidebar-slim .nav-item[data-target]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;

            // Controle de visual (Sidebar Active)
            document.querySelectorAll('.sidebar-fixed .nav-item, .sidebar-slim .nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll(`.nav-item[data-target="${target}"]`).forEach(n => n.classList.add('active'));

            // Controle de visual (Telas)
            if (target) {
                document.querySelectorAll('main.main-surface > .view').forEach(v => v.classList.add('hidden'));
                const viewEl = document.getElementById(`view-${target}`);
                if (viewEl) viewEl.classList.remove('hidden');
            }

            // Inicializadores condicionais
            if (target === 'loja' && window.loadLojinha) window.loadLojinha();
            if (target === 'prontuario' && window.loadProntuarios) window.loadProntuarios();
            if (target === 'clientes' && typeof loadClientes === 'function') loadClientes();
            if (target === 'agenda') {
                setTimeout(() => { if (typeof renderCalendar === 'function') renderCalendar(); else if (window.renderCalendar) window.renderCalendar(); }, 100);
            }
        });
    });

    // Registra clique nos modos da agenda
    document.querySelectorAll('.mode-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-view-btn').forEach(b => {
                b.classList.remove('active');
                b.style.color = '#4B5563';
            });
            btn.classList.add('active');
            btn.style.color = '#2563EB';
            window.currentAgendaMode = btn.dataset.mode;
            if (typeof window.renderCalendar === 'function') window.renderCalendar();
        });
    });

    // Atualização do Relógio em Tempo Real (Horário de Brasília)
    const updateClock = () => {
        const clk = document.getElementById('topbar-clock');
        if (!clk) return;
        const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
        const now = new Date(nowStr);
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        clk.innerText = `${d}/${m}/${y} - ${h}:${min}`;
    };

    updateClock();
    setInterval(updateClock, 10000);

});

// ============================================================
// MÓDULO FINANCEIRO PREMIUM — Mayaflow
// ============================================================
(function () {
    'use strict';

    const LS_KEY = 'movia_financeiro_v2';
    let finDados = [];
    let filtroAtual = 'mes';
    let chartFluxo = null;
    let editId = null;

    // ---- Helpers ----
    const fmtBRL = v => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const parseValor = str => {
        if (!str) return 0;
        return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0;
    };
    const hoje = () => new Date().toISOString().slice(0, 10);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    function loadDados() {
        try { finDados = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { finDados = []; }
    }
    function saveDados() {
        try { localStorage.setItem(LS_KEY, JSON.stringify(finDados)); } catch (e) { console.warn('LS Financeiro error', e); }
    }
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

    // ---- Data Filters ----
    function filtrarPorPeriodo(arr, periodo) {
        const now = new Date();
        const todayStr = hoje();
        return arr.filter(item => {
            const d = item.data || '';
            if (!d) return false;
            const dt = new Date(d + 'T00:00:00');
            switch (periodo) {
                case 'hoje': return d === todayStr;
                case 'semana': {
                    const ini = new Date(now); ini.setDate(now.getDate() - now.getDay()); ini.setHours(0, 0, 0, 0);
                    return dt >= ini;
                }
                case 'mes': return d.slice(0, 7) === todayStr.slice(0, 7);
                case '30dias': {
                    const ago = new Date(now); ago.setDate(now.getDate() - 30); ago.setHours(0, 0, 0, 0);
                    return dt >= ago;
                }
                case 'ano': return d.slice(0, 4) === todayStr.slice(0, 4);
                case 'todos': default: return true;
            }
        });
    }

    // ---- KPI Calc ----
    function calcKPIs(arr) {
        const mesAtual = hoje().slice(0, 7);
        const doMes = arr.filter(i => (i.data || '').slice(0, 7) === mesAtual);
        const entradas = doMes.filter(i => i.tipo === 'receita').reduce((s, i) => s + parseValor(i.valor), 0);
        const saidas = doMes.filter(i => i.tipo === 'despesa').reduce((s, i) => s + parseValor(i.valor), 0);
        const pendentes = arr.filter(i => i.tipo === 'receita' && (i.status === 'Pendente' || i.status === 'Agendado')).reduce((s, i) => s + parseValor(i.valor), 0);
        const apagar = arr.filter(i => i.tipo === 'despesa' && (i.status === 'Pendente' || i.status === 'Agendado')).reduce((s, i) => s + parseValor(i.valor), 0);
        const recebido = arr.filter(i => i.tipo === 'receita' && i.status === 'Pago').reduce((s, i) => s + parseValor(i.valor), 0);
        const totalRec = arr.filter(i => i.tipo === 'receita').reduce((s, i) => s + parseValor(i.valor), 0);
        const totalDep = arr.filter(i => i.tipo === 'despesa').reduce((s, i) => s + parseValor(i.valor), 0);
        const lucro = entradas - saidas;
        const margem = entradas > 0 ? Math.round((lucro / entradas) * 100) : 0;
        const nRec = doMes.filter(i => i.tipo === 'receita').length;
        const ticket = nRec > 0 ? entradas / nRec : 0;

        // hoje
        const tdStr = hoje();
        const tdEntradas = arr.filter(i => i.data === tdStr && i.tipo === 'receita').reduce((s, i) => s + parseValor(i.valor), 0);
        const tdSaidas = arr.filter(i => i.data === tdStr && i.tipo === 'despesa').reduce((s, i) => s + parseValor(i.valor), 0);
        const tdCobrancas = arr.filter(i => i.data === tdStr && i.status === 'Pendente').length;
        const tdAtrasadas = arr.filter(i => i.data < tdStr && i.status === 'Pendente').length;

        return {
            entradas, saidas, saldo: entradas - saidas, receber: pendentes, apagar, lucro, margem,
            ticket, recebido, pendente: pendentes, totalRec, totalDep,
            tdEntradas, tdSaidas, tdCobrancas, tdAtrasadas
        };
    }

    function updateKPIs() {
        const k = calcKPIs(finDados);
        const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        s('kpi-fin-entradas', fmtBRL(k.entradas));
        s('kpi-fin-saidas', fmtBRL(k.saidas));
        s('kpi-fin-saldo', fmtBRL(k.saldo));
        s('kpi-fin-receber', fmtBRL(k.receber));
        s('kpi-fin-pagar', fmtBRL(k.apagar));
        s('kpi-fin-lucro', fmtBRL(k.lucro));
        s('ind-receita', fmtBRL(k.totalRec));
        s('ind-despesas', fmtBRL(k.totalDep));
        s('ind-lucro', fmtBRL(k.lucro));
        s('ind-margem', k.margem + '%');
        s('ind-ticket', fmtBRL(k.ticket));
        s('ind-recebido', fmtBRL(k.recebido));
        s('ind-pendente', fmtBRL(k.pendente));
        // Saldo color
        const sEl = document.getElementById('kpi-fin-saldo');
        if (sEl) sEl.style.color = k.saldo >= 0 ? 'white' : '#FCA5A5';
        // lucro color
        const lEl = document.getElementById('kpi-fin-lucro');
        if (lEl) lEl.style.color = k.lucro >= 0 ? '#10B981' : '#EF4444';
        // Hoje
        s('today-entradas', fmtBRL(k.tdEntradas));
        s('today-saidas', fmtBRL(k.tdSaidas));
        s('today-cobrancas', k.tdCobrancas);
        s('today-atrasadas', k.tdAtrasadas);
        s('today-previsto', fmtBRL(k.tdEntradas));
        // Date label
        const dtEl = document.getElementById('fin-date-today');
        if (dtEl) {
            const d = new Date();
            dtEl.textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        }
    }

    // ---- Tabs Financeiro ----
    window.switchFinTab = function (tabId, btn) {
        // Handle Active Button States
        document.querySelectorAll('.fin-tab-link').forEach(b => {
            b.classList.remove('active');
            b.classList.add('text-muted');
            b.style.borderBottomColor = 'transparent';
        });
        btn.classList.add('active');
        btn.classList.remove('text-muted');
        btn.style.borderBottomColor = '#10B981';

        // Toggle Content Views
        document.getElementById('fin-tab-visao-content').style.display = (tabId === 'visao') ? 'flex' : 'none';
        document.getElementById('fin-tab-transacoes-content').style.display = (tabId === 'transacoes') ? 'flex' : 'none';
    };

    // ---- Gráfico ----
    window.initGraficoFluxo = function (dias, btn) {
        // Toggle active button
        if (btn) {
            document.querySelectorAll('.fin-chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        const canvas = document.getElementById('chart-fluxo');
        if (!canvas) return;
        if (chartFluxo) { chartFluxo.destroy(); chartFluxo = null; }

        loadDados();
        const labels = [];
        const dataEntradas = [];
        const dataSaidas = [];
        const dataSaldo = [];

        for (let i = dias - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().slice(0, 10);
            labels.push(dias <= 30 ? `${d.getDate()}/${d.getMonth() + 1}` : `${meses[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`);
            const ent = finDados.filter(x => x.data === dStr && x.tipo === 'receita').reduce((s, x) => s + parseValor(x.valor), 0);
            const sai = finDados.filter(x => x.data === dStr && x.tipo === 'despesa').reduce((s, x) => s + parseValor(x.valor), 0);
            dataEntradas.push(ent);
            dataSaidas.push(sai);
            dataSaldo.push(ent - sai);
        }

        chartFluxo = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: dias > 30 ? labels.filter((_, i) => i % Math.ceil(dias / 20) === 0) : labels,
                datasets: [
                    { label: 'Entradas', data: dias > 30 ? dataEntradas.filter((_, i) => i % Math.ceil(dias / 20) === 0) : dataEntradas, backgroundColor: 'rgba(16,185,129,0.18)', borderColor: '#10B981', borderWidth: 2, borderRadius: 6 },
                    { label: 'Saídas', data: dias > 30 ? dataSaidas.filter((_, i) => i % Math.ceil(dias / 20) === 0) : dataSaidas, backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#EF4444', borderWidth: 2, borderRadius: 6 },
                    { label: 'Saldo', data: dias > 30 ? dataSaldo.filter((_, i) => i % Math.ceil(dias / 20) === 0) : dataSaldo, type: 'line', borderColor: '#4F46E5', borderWidth: 2.5, fill: false, pointRadius: 3, tension: 0.4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { size: 12, weight: '600' }, padding: 20 } }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtBRL(ctx.raw)}` } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 12 } },
                    y: { grid: { color: '#F3F4F6' }, ticks: { callback: v => 'R$' + (v / 1000 >= 1 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)), font: { size: 11 } } }
                }
            }
        });
    };

    // ---- Render Tabela ----
    const catColors = {
        'Mensalidade': { bg: '#DCFCE7', color: '#16A34A' },
        'Avaliação': { bg: '#DBEAFE', color: '#2563EB' },
        'Venda de Produtos': { bg: '#EDE9FE', color: '#7C3AED' },
        'Aluguel': { bg: '#FEF3C7', color: '#D97706' },
        'Funcionários': { bg: '#FEF9C3', color: '#CA8A04' },
        'Marketing': { bg: '#FEF3C7', color: '#92400E' },
        'Impostos': { bg: '#F3F4F6', color: '#374151' },
        'Manutenção': { bg: '#DBEAFE', color: '#1E40AF' },
        'Outros': { bg: '#F3F4F6', color: '#6B7280' }
    };
    const pgtoIcons = { 'PIX': '⚡', 'Cartão de Crédito': '💳', 'Cartão de Débito': '💳', 'Dinheiro': '💵', 'Boleto': '🏦', 'Transferência': '🔄' };

    window.renderExtrato = function () {
        const tbody = document.getElementById('tbody-financeiro');
        const emptyRow = document.getElementById('fin-empty-state');
        if (!tbody) return;

        loadDados();
        let arr = filtrarPorPeriodo(finDados, filtroAtual);

        // Busca
        const search = (document.getElementById('fin-search') || {}).value || '';
        if (search) {
            const q = search.toLowerCase();
            arr = arr.filter(i =>
                (i.desc || '').toLowerCase().includes(q) ||
                (i.cliente || '').toLowerCase().includes(q) ||
                (i.fornecedor || '').toLowerCase().includes(q) ||
                (i.cat || '').toLowerCase().includes(q) ||
                String(i.valor || '').includes(q)
            );
        }

        // Filtro tipo
        const tipoFiltro = (document.getElementById('fin-filter-tipo') || {}).value || '';
        if (tipoFiltro) arr = arr.filter(i => i.tipo === tipoFiltro);

        // Ordenar: mais recente primeiro
        arr = [...arr].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

        // Limpar linhas dinâmicas
        Array.from(tbody.querySelectorAll('tr:not(#fin-empty-state)')).forEach(r => r.remove());

        if (arr.length === 0) {
            if (emptyRow) emptyRow.style.display = '';
            return;
        }
        if (emptyRow) emptyRow.style.display = 'none';

        arr.forEach(item => {
            const cat = item.cat || 'Outros';
            const catStyle = catColors[cat] || catColors['Outros'];
            const statusClass = { 'Pago': 'status-pago', 'Pendente': 'status-pendente', 'Vencido': 'status-vencido', 'Agendado': 'status-agendado' }[item.status] || 'status-pendente';
            const statusDot = { 'Pago': '🟢', 'Pendente': '🟠', 'Vencido': '🔴', 'Agendado': '🔵' }[item.status] || '⚪';
            const pgto = pgtoIcons[item.pagamento] || '💰';
            const isReceita = item.tipo === 'receita';
            const nome = item.cliente || item.fornecedor || '—';
            const dataFmt = item.data ? item.data.split('-').reverse().join('/') : '—';
            const valorFmt = fmtBRL(parseValor(item.valor));
            const valorColor = isReceita ? '#10B981' : '#EF4444';
            const initials = nome !== '—' ? nome.slice(0, 2).toUpperCase() : '??';
            const avatarBg = isReceita ? '#DCFCE7' : '#FEE2E2';
            const avatarColor = isReceita ? '#16A34A' : '#DC2626';

            const tr = document.createElement('tr');
            const safeId = JSON.stringify(item.id || '').replace(/"/g, '&quot;');
            tr.innerHTML = `
                <td style="white-space:nowrap; color:#6B7280; font-size:0.82rem;">${dataFmt}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:${avatarBg}; color:${avatarColor}; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:800; flex-shrink:0;">${initials}</div>
                        <div>
                            <div style="font-weight:700; font-size:0.85rem; color:var(--dark);">${item.desc || '—'}</div>
                            <div style="font-size:0.75rem; color:#9CA3AF;">${nome}</div>
                        </div>
                    </div>
                </td>
                <td><span class="cat-badge" style="background:${catStyle.bg}; color:${catStyle.color};">${cat}</span></td>
                <td style="font-size:0.82rem; color:#6B7280;">${pgto} ${item.pagamento || '—'}</td>
                <td><span style="font-weight:800; font-size:0.9rem; color:${valorColor};">${isReceita ? '+' : '-'}${valorFmt}</span></td>
                <td><span class="status-badge ${statusClass}">${statusDot} ${item.status || '—'}</span></td>
                <td>
                    <div style="display:flex; gap:4px; justify-content:flex-end;">
                        <button onclick='editarLancamento(${JSON.stringify(item.id)})' title="Editar" style="padding:5px 8px; background:#EEF2FF; color:#4F46E5; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">✏️</button>
                        <button onclick='duplicarLancamento(${JSON.stringify(item.id)})' title="Duplicar" style="padding:5px 8px; background:#F0FDF4; color:#16A34A; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">📋</button>
                        <button onclick='deletarLancamento(${JSON.stringify(item.id)})' title="Excluir" style="padding:5px 8px; background:#FEF2F2; color:#DC2626; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">🗑️</button>
                    </div>
                </td>`;
            tbody.appendChild(tr);
        });
    };

    // ---- Filtro Data ----
    window.setFiltroData = function (periodo, btn) {
        filtroAtual = periodo;
        document.querySelectorAll('.fin-filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        renderExtrato();
        updateKPIs();
    };

    // ---- Modais ----
    window.abrirModalReceita = function () {
        editId = null;
        preencherClientesList();
        const d = document.getElementById('rec-data');
        if (d && !d.value) d.value = hoje();
        document.getElementById('modal-receita').classList.add('open');
    };
    window.abrirModalDespesa = function () {
        editId = null;
        const d = document.getElementById('dep-data');
        if (d && !d.value) d.value = hoje();
        document.getElementById('modal-despesa').classList.add('open');
    };
    window.fecharModais = function () {
        document.querySelectorAll('.fin-modal-overlay').forEach(m => m.classList.remove('open'));
        editId = null;
    };
    window.toggleRecRecorrencia = function () {
        const el = document.getElementById('rec-recorrencia-opts');
        const chk = document.getElementById('rec-recorrente');
        if (el) el.style.display = chk && chk.checked ? 'block' : 'none';
    };
    window.toggleDepRecorrencia = function () {
        const el = document.getElementById('dep-recorrencia-opts');
        const chk = document.getElementById('dep-recorrente');
        if (el) el.style.display = chk && chk.checked ? 'block' : 'none';
    };

    // Close on overlay click
    document.addEventListener('click', e => {
        if (e.target.classList.contains('fin-modal-overlay')) fecharModais();
    });

    // ---- Salvar ----
    window.salvarLancamento = function (tipo) {
        loadDados();
        let item;
        if (tipo === 'receita') {
            const valor = parseValor(document.getElementById('rec-valor').value);
            if (!valor) { alert('Informe o valor.'); return; }
            item = {
                id: editId || uid(), tipo, editado: !!editId,
                cliente: document.getElementById('rec-cliente').value,
                desc: document.getElementById('rec-desc').value || 'Receita',
                cat: document.getElementById('rec-cat').value,
                centro: document.getElementById('rec-centro').value,
                valor, data: document.getElementById('rec-data').value || hoje(),
                pagamento: document.getElementById('rec-forma').value,
                conta: document.getElementById('rec-conta').value,
                status: document.getElementById('rec-status').value,
                obs: document.getElementById('rec-obs').value,
                recorrente: document.getElementById('rec-recorrente').checked,
                recorrencia: document.getElementById('rec-recorrencia').value,
                criadoEm: new Date().toISOString()
            };
            // Limpa form
            ['rec-cliente', 'rec-valor', 'rec-desc', 'rec-centro', 'rec-conta', 'rec-obs'].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = '';
            });
            document.getElementById('rec-recorrente').checked = false;
            toggleRecRecorrencia();
        } else {
            const valor = parseValor(document.getElementById('dep-valor').value);
            if (!valor) { alert('Informe o valor.'); return; }
            item = {
                id: editId || uid(), tipo, editado: !!editId,
                fornecedor: document.getElementById('dep-fornecedor').value,
                desc: document.getElementById('dep-desc').value || 'Despesa',
                cat: document.getElementById('dep-cat').value,
                centro: document.getElementById('dep-centro').value,
                valor, data: document.getElementById('dep-data').value || hoje(),
                pagamento: document.getElementById('dep-forma').value,
                conta: document.getElementById('dep-conta').value,
                status: document.getElementById('dep-status').value,
                obs: document.getElementById('dep-obs').value,
                recorrente: document.getElementById('dep-recorrente').checked,
                recorrencia: document.getElementById('dep-recorrencia').value,
                criadoEm: new Date().toISOString()
            };
            ['dep-fornecedor', 'dep-valor', 'dep-desc', 'dep-centro', 'dep-conta', 'dep-obs'].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = '';
            });
            document.getElementById('dep-recorrente').checked = false;
            toggleDepRecorrencia();
        }

        if (editId) {
            const idx = finDados.findIndex(i => i.id === editId);
            if (idx >= 0) finDados[idx] = item; else finDados.push(item);
        } else {
            finDados.push(item);
        }
        saveDados();
        fecharModais();
        renderExtrato();
        updateKPIs();
        initGraficoFluxo(7);
    };

    // ---- Deletar ----
    window.deletarLancamento = function (id) {
        if (!confirm('Excluir este lançamento?')) return;
        loadDados();
        finDados = finDados.filter(i => i.id !== id);
        saveDados();
        renderExtrato();
        updateKPIs();
        initGraficoFluxo(7);
    };

    // ---- Duplicar ----
    window.duplicarLancamento = function (id) {
        loadDados();
        const orig = finDados.find(i => i.id === id);
        if (!orig) return;
        const clone = { ...orig, id: uid(), data: hoje(), criadoEm: new Date().toISOString() };
        finDados.push(clone);
        saveDados();
        renderExtrato();
        updateKPIs();
        initGraficoFluxo(7);
    };

    // ---- Editar ----
    window.editarLancamento = function (id) {
        loadDados();
        const item = finDados.find(i => i.id === id);
        if (!item) return;
        editId = id;
        if (item.tipo === 'receita') {
            const sv = (eid, val) => { const el = document.getElementById(eid); if (el) el.value = val || ''; };
            sv('rec-cliente', item.cliente); sv('rec-valor', item.valor);
            sv('rec-desc', item.desc); sv('rec-cat', item.cat); sv('rec-centro', item.centro);
            sv('rec-data', item.data); sv('rec-forma', item.pagamento); sv('rec-conta', item.conta);
            sv('rec-status', item.status); sv('rec-obs', item.obs);
            document.getElementById('modal-receita').classList.add('open');
        } else {
            const sv = (eid, val) => { const el = document.getElementById(eid); if (el) el.value = val || ''; };
            sv('dep-fornecedor', item.fornecedor); sv('dep-valor', item.valor);
            sv('dep-desc', item.desc); sv('dep-cat', item.cat); sv('dep-centro', item.centro);
            sv('dep-data', item.data); sv('dep-forma', item.pagamento); sv('dep-conta', item.conta);
            sv('dep-status', item.status); sv('dep-obs', item.obs);
            document.getElementById('modal-despesa').classList.add('open');
        }
    };

    // ---- Preencher lista de clientes ----
    function preencherClientesList() {
        const dl = document.getElementById('fin-clientes-list');
        if (!dl) return;
        dl.innerHTML = '';
        try {
            const alunos = JSON.parse(localStorage.getItem('movia_alunos') || '[]');
            alunos.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.nome || '';
                dl.appendChild(opt);
            });
        } catch (e) { }
    }

    // ---- Integração com Loja (hook) ----
    window.registrarVendaFinanceiro = function (desc, valor, cliente) {
        loadDados();
        finDados.push({ id: uid(), tipo: 'receita', desc: 'Venda Loja: ' + (desc || ''), cliente: cliente || '', cat: 'Venda de Produtos', valor, data: hoje(), pagamento: 'PIX', status: 'Pago', criadoEm: new Date().toISOString() });
        saveDados();
        if (document.getElementById('view-financeiro') && !document.getElementById('view-financeiro').classList.contains('hidden')) { renderExtrato(); updateKPIs(); }
    };

    // ---- Init ao navegar para aba ----
    function initFinanceiro() {
        loadDados();
        updateKPIs();
        renderExtrato();
        initGraficoFluxo(7);
        preencherClientesList();
    }

    // Observar troca de aba
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.nav-item[data-target="financeiro"]').forEach(el => {
            el.addEventListener('click', () => setTimeout(initFinanceiro, 80));
        });
        // Se já está na aba (ex: reload)
        const vf = document.getElementById('view-financeiro');
        if (vf && !vf.classList.contains('hidden')) initFinanceiro();
    });

    // ---- Suporte IA Maya (Workspace/Widget) ----
    let suporteMayaInitialized = false;
    function initSuporteMaya() {
        if (suporteMayaInitialized) {
            const chatFeed = document.getElementById('suporte-chat-feed');
            const widgetFeed = document.getElementById('maya-widget-feed');
            if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
            if (widgetFeed) widgetFeed.scrollTop = widgetFeed.scrollHeight;
            return;
        }
        suporteMayaInitialized = true;

        const chatFeed = document.getElementById('suporte-chat-feed');
        const widgetFeed = document.getElementById('maya-widget-feed');
        const iptMsg = document.getElementById('ipt-suporte-msg');
        const iptWidgetMsg = document.getElementById('ipt-maya-widget-msg');
        const btnEnviar = document.getElementById('btn-suporte-enviar');
        const btnWidgetEnviar = document.getElementById('btn-maya-widget-enviar');
        
        // Widget Floating Toggles
        const btnTrigger = document.getElementById('btn-maya-trigger');
        const chatCard = document.getElementById('maya-chat-card');
        const btnMinimizar = document.getElementById('btn-minimizar-maya');
        const triggerBadge = document.getElementById('maya-trigger-badge');

        if (btnTrigger && chatCard) {
            btnTrigger.addEventListener('click', () => {
                const isClosed = chatCard.style.opacity !== '1' || chatCard.style.height === '0px' || !chatCard.style.height;
                if (isClosed) {
                    // Abrir
                    chatCard.style.opacity = '1';
                    chatCard.style.pointerEvents = 'auto';
                    chatCard.style.transform = 'scale(1)';
                    chatCard.style.height = '480px';
                    if (triggerBadge) triggerBadge.style.display = 'none';
                    if (widgetFeed) widgetFeed.scrollTop = widgetFeed.scrollHeight;
                } else {
                    // Fechar
                    chatCard.style.opacity = '0';
                    chatCard.style.pointerEvents = 'none';
                    chatCard.style.transform = 'scale(0.9)';
                    chatCard.style.height = '0';
                }
            });
        }

        if (btnMinimizar && chatCard) {
            btnMinimizar.addEventListener('click', (e) => {
                e.stopPropagation();
                chatCard.style.opacity = '0';
                chatCard.style.pointerEvents = 'none';
                chatCard.style.transform = 'scale(0.9)';
                chatCard.style.height = '0';
            });
        }

        // Welcome Messages Initializer
        if (chatFeed && chatFeed.children.length === 0) {
            appendChatBubble(chatFeed, 'assistant', 'Olá, Thiago! Sou a **Maya**, sua assistente virtual. Posso te dar suporte completo, ensinar caminhos do sistema ou analisar dados em tempo real.<br><br>💡 Tente perguntar: *Quantos alunos temos cadastrados?*, *Como está o faturamento?* ou escolha um dos atalhos!');
        }
        if (widgetFeed && widgetFeed.children.length === 0) {
            appendChatBubble(widgetFeed, 'assistant', 'Olá! Sou a **Maya**. Como posso te ajudar hoje no sistema?');
        }

        // Helpers
        function appendChatBubble(feed, sender, text) {
            if (!feed) return;
            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.gap = '10px';
            wrap.style.margin = '8px 0';
            wrap.style.width = '100%';
            wrap.style.alignItems = 'flex-start';

            if (sender === 'user') {
                wrap.style.justifyContent = 'flex-end';
                wrap.innerHTML = `
                    <div style="max-width: 80%; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 10px 14px; border-radius: 12px 12px 0 12px; font-size: 13px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.05); line-height: 1.4;">
                        ${text}
                    </div>
                `;
            } else {
                wrap.style.justifyContent = 'flex-start';
                wrap.innerHTML = `
                    <img src="avatar-maya.png" alt="Maya" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-shrink: 0;">
                    <div style="max-width: 80%; background: white; border: 1px solid var(--border-soft); color: var(--dark); padding: 10px 14px; border-radius: 0 12px 12px 12px; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); line-height: 1.4;">
                        ${text}
                    </div>
                `;
            }
            feed.appendChild(wrap);
            feed.scrollTop = feed.scrollHeight;
        }

        function appendTypingIndicator(feed) {
            if (!feed) return null;
            const wrap = document.createElement('div');
            wrap.id = 'typing-indicator-' + feed.id;
            wrap.style.display = 'flex';
            wrap.style.gap = '10px';
            wrap.style.margin = '8px 0';
            wrap.style.width = '100%';
            wrap.style.alignItems = 'center';
            wrap.innerHTML = `
                <img src="avatar-maya.png" alt="Maya" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink:0;">
                <div style="background: rgba(0,0,0,0.04); padding: 10px 14px; border-radius: 12px; font-size: 12px; font-weight:500; color: #6B7280; display:flex; align-items:center; gap:6px;">
                    Maya está digitando
                    <span class="typing-dot" style="width:4px; height:4px; border-radius:50%; background:#9CA3AF; display:inline-block; animation: bounce 1.4s infinite ease-in-out both;"></span>
                    <span class="typing-dot" style="width:4px; height:4px; border-radius:50%; background:#9CA3AF; display:inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
                    <span class="typing-dot" style="width:4px; height:4px; border-radius:50%; background:#9CA3AF; display:inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
                </div>
            `;
            feed.appendChild(wrap);
            feed.scrollTop = feed.scrollHeight;
            return wrap;
        }

        function getBotResponse(userMsg) {
            const raw = userMsg.toLowerCase().trim();

            // Analytics variables
            let countAlunos = 0;
            if (typeof window.lastAlunosCount === 'number') {
                countAlunos = window.lastAlunosCount;
            } else {
                const crmRows = document.querySelectorAll('.crm-row');
                if (crmRows.length > 0) {
                    countAlunos = crmRows.length;
                } else {
                    const lblAlunos = document.getElementById('kpi-alunos');
                    if (lblAlunos) {
                        countAlunos = parseInt(lblAlunos.innerText || '0');
                    }
                }
            }
            if (!countAlunos) {
                try {
                    countAlunos = JSON.parse(localStorage.getItem('movia_alunos') || localStorage.getItem('movia_pacientes') || '[]').length;
                } catch (e) {}
            }

            let countProds = 0;
            let lowStock = [];
            try {
                const prods = JSON.parse(localStorage.getItem('movia_loja') || '[]');
                countProds = prods.length;
                prods.forEach(p => {
                    let total = 0;
                    if (p.variacoesStock) {
                        Object.values(p.variacoesStock).forEach(v => total += Number(v));
                    } else {
                        total = Number(p.estoque || 0);
                    }
                    if (total <= 2) {
                        lowStock.push(`${p.nome} (${total} un)`);
                    }
                });
            } catch (e) {}

            let faturamento = 0;
            let totalVendas = 0;
            try {
                const fin = JSON.parse(localStorage.getItem('movia_financeiro_v2') || '[]');
                fin.forEach(f => {
                    if (f.tipo === 'receita') {
                        faturamento += parseFloat(f.valor || 0);
                    }
                    if (f.desc && f.desc.toLowerCase().includes('venda')) {
                        totalVendas++;
                    }
                });
            } catch (e) {}

            // Keyword Matching Router
            if (raw.includes('crm') || raw.includes('funcionamento do crm') || raw.includes('como funciona o crm') || raw.includes('funil') || raw.includes('leads')) {
                return `**Como funciona o CRM (Funil de Vendas e Leads) no Mayaflow:**<br><br>O módulo CRM (Pipeline) foi desenhado para organizar o fluxo comercial e as pessoas que entram em contato com o seu negócio.<br>1. **Adicionar Leads:** Clique em '+ Novo Lead' para incluir prospects que demonstraram interesse.<br>2. **Mover no Funil (Kanban):** Arraste o card do Lead entre as colunas "🎯 Novo Lead", "💬 Em Contato", "🏋️ Aula Experimental" e "✅ Fechou Plano".<br>3. **Fechamento:** Ao mover para "Fechou Plano", a venda ganha dados financeiros e o prospect pode ser efetivado como aluno do sistema!`;
            }
            if (raw.includes('dashboard') || raw.includes('painel principal') || raw.includes('acesso rápido')) {
                return `**Dashboard Inicial:**<br><br>O Dashboard é o coração do Mayaflow. Nele você encontra:<br>- **Acesso Rápido:** Botões coloridos para saltar direto para Cadastros, Dinheiro de Entrada ou Nova Venda.<br>- **Métricas em Evolução:** Gráficos que te mostram rapidamente quantos novos clientes entraram nos últimos meses.<br>- **Atualizações do ecossistema:** Avisos rápidos de relatórios, pendências e chamadas de ação para o bem do seu estúdio.`;
            }
            if (raw.includes('agenda') || raw.includes('agendar') || raw.includes('agendamento') || raw.includes('turmas') || raw.includes('horários')) {
                return `**Gestão de Agenda e Turmas:**<br><br>Na aba **Agenda**, você pode mapear os horários de fluxo de clínica ou estúdio marcando eventos em um calendário linear. Você pode:<br>1. Cadastrar aulas limitando quantidade de assentos.<br>2. Atrelar o nome aos alunos do seu CRM (auto-completar inteligente).<br>3. Emitir check-in de presenças com Integração a assinaturas do Wellhub (Gympass) ou TotalPass.`;
            }
            if (raw.includes('prontuário') || raw.includes('anamnese') || raw.includes('fichas médicas') || raw.includes('evoluções')) {
                return `**Prontuários e Anamneses:**<br><br>Na aba correspondente, você elabora formulários vitais do paciente:<br>- **Prontuários Eletrônicos:** Arquiva os encontros na clínica, podendo imprimir e até exportar como PDF preenchido com seu CRM.<br>- **Anamnese (Triagem Inicial):** Questionários para registrar se há lesões, hipertenções, queixas, restrições ou limitações. Ficam no perfil vitalício.`;
            }
            if (raw.includes('aluno') || raw.includes('cliente') || raw.includes('paciente')) {
                return `Você tem atualmente **${countAlunos} alunos/clientes** cadastrados no sistema.<br><br>💡 **Para cadastrar um novo aluno:**<br>1. Acesse o menu **Alunos / Clientes** no painel lateral.<br>2. Clique em **+ Novo Aluno** no canto superior direito.<br>3. Preencha os campos e salve!`;
            }
            if (raw.includes('venda') || raw.includes('vender') || raw.includes('loja') || raw.includes('lojinha')) {
                return `Atualmente existem **${countProds} produtos** cadastrados, com **${totalVendas} vendas** registradas financeiramente.<br><br>🛒 **Como registrar vendas rápidas:**<br>1. Vá na aba de navegação da **Lojinha**.<br>2. Na lista de produtos cadastrados, clique em **Vender** correspondente ao item desejado.<br>3. Selecione o tamanho/variação, informe a quantidade e confirme a transação. O sistema reduz o estoque automaticamente e gera o extrato de fluxo de caixa!`;
            }
            if (raw.includes('faturamento') || raw.includes('caixa) ') || raw.includes('receita') || raw.includes('despesa') || raw.includes('relatório') || raw.includes('financeiro')) {
                return `O faturamento bruto acumulado de receitas registradas (incluindo vendas e mensalidades) é de **R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.<br><br>💰 **Para gerenciar lançamentos:**<br>1. Acesse a aba **Financeiro**.<br>2. Clique nos botões **+ Receita** ou **+ Despesa** no painel superior para registrar novos fluxos de caixa.<br>3. Visualize o balanço mensal pelo gráfico e controle o fluxo pelo extrato detalhado.`;
            }
            if (raw.includes('estoque') || raw.includes('baixo') || raw.includes('esgotado') || raw.includes('quantidade')) {
                let stockText = `Temos um catálogo cadastrado de **${countProds} itens**.<br>`;
                if (lowStock.length > 0) {
                    stockText += `<br>⚠️ **Itens esgotados ou com baixo estoque (2 un ou menos):**<br>${lowStock.map(l => '• ' + l).join('<br>')}`;
                } else {
                    stockText += `<br>✅ Todos os seus produtos possuem estoque regular.`;
                }
                stockText += `<br><br>📦 **Para ajustar estoques:**<br>1. Vá em **Lojinha** e selecione a sub-aba **Estoque**.<br>2. Clique no número indicador de estoque para ajustar a quantidade correspondente de tamanhos/variações.`;
                return stockText;
            }
            if (raw.includes('cadastro') || raw.includes('cadastrar') || raw.includes('novo')) {
                return `Você pode estender seus registros clicando nos botões rápidos correspondentes:<br>• **Alunos:** Clique em '+ Novo Aluno' na aba de Alunos.<br>• **Produtos:** Clique em '+ Novo Produto' na aba de Lojinha.<br>• **Agenda:** Clique na Agenda para lançar novas turmas ou atendimentos.`;
            }
            if (raw.includes('oi') || raw.includes('olá') || raw.includes('ola') || raw.includes('ajuda') || raw.includes('como funciona') || raw.includes('suporte')) {
                return `Olá! Sou a **Maya**, a inteligência de suporte do Mayaflow. Estou aqui para ajudar você a dominar todos os módulos do sistema!<br><br>Sinta-se à vontade para perguntar como funciona qualquer tela, como:<br>• *Como funciona o CRM?*<br>• *Como funcionam os Prontuários e Anamneses?*<br>• *Como utilizar a Lojinha ou a Agenda?*<br>• *Quais são os nossos números (faturamento, alunos e estoque)?*`;
            }

            return `Entendi a sua mensagem! Como assistente virtual do Mayaflow, estou em treinamento contínuo.<br><br>Mas já consigo te dar um panorama enorme sobre o funcionamento das seguintes áreas:<br>🔹 **CRM e Alunos**<br>🔹 **Lojinha Vendas e Estoque**<br>🔹 **Dashboard e Financeiro**<br>🔹 **Agenda e Prontuários Eletrônicos**<br><br>Se preferir, pergunte diretamente: *Como funciona a Agenda?* ou *Quantos clientes temos?*`;
        }

        // Submitting Messages
        function handleUserSubmit(inputEl, feedEl) {
            if (!inputEl || !feedEl) return;
            const text = inputEl.value.trim();
            if (!text) return;

            // Append User msg
            appendChatBubble(feedEl, 'user', text);
            inputEl.value = '';

            // Loading Typing Indicator
            const typingIndicator = appendTypingIndicator(feedEl);

            // Fetch and Send Bot msg
            setTimeout(() => {
                if (typingIndicator) typingIndicator.remove();
                const reply = getBotResponse(text);
                appendChatBubble(feedEl, 'assistant', reply);
            }, 800);
        }

        // Actions hooks
        if (btnEnviar && iptMsg && chatFeed) {
            btnEnviar.addEventListener('click', () => handleUserSubmit(iptMsg, chatFeed));
            iptMsg.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleUserSubmit(iptMsg, chatFeed);
            });
        }
        if (btnWidgetEnviar && iptWidgetMsg && widgetFeed) {
            btnWidgetEnviar.addEventListener('click', () => handleUserSubmit(iptWidgetMsg, widgetFeed));
            iptWidgetMsg.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleUserSubmit(iptWidgetMsg, widgetFeed);
            });
        }

        // Suggestions pills
        document.querySelectorAll('.suporte-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                if (iptMsg) {
                    iptMsg.value = pill.dataset.msg;
                    handleUserSubmit(iptMsg, chatFeed);
                }
            });
        });
        document.querySelectorAll('.maya-widget-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                if (iptWidgetMsg) {
                    iptWidgetMsg.value = pill.dataset.msg;
                    handleUserSubmit(iptWidgetMsg, widgetFeed);
                }
            });
        });
        document.querySelectorAll('.faq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (iptMsg) {
                    iptMsg.value = btn.dataset.q;
                    handleUserSubmit(iptMsg, chatFeed);
                }
            });
        });
    }

    // Dom Load Hook
    document.addEventListener('DOMContentLoaded', () => {
        initSuporteMaya();
        
        // Watch nav Support clicks
        document.querySelectorAll('.nav-item[data-target="suporte"]').forEach(el => {
            el.addEventListener('click', () => {
                setTimeout(initSuporteMaya, 50);
            });
        });
    });

    // Expor para outros módulos
    window.initFinanceiro = initFinanceiro;
    window.initSuporteMaya = initSuporteMaya;

})();

