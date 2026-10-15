
const telaAcesso =
    document.getElementById("tela-acesso");

const appPrincipal =
    document.getElementById("app-principal");

const opcoesAcesso =
    document.getElementById("opcoes-acesso");

const formLogin =
    document.getElementById("form-login");

const formCadastro =
    document.getElementById("form-cadastro");

const abrirLogin =
    document.getElementById("abrir-login");

const abrirCadastro =
    document.getElementById("abrir-cadastro");

const voltarLogin =
    document.getElementById("voltar-login");

const voltarCadastro =
    document.getElementById("voltar-cadastro");

const btnEntrar =
    document.getElementById("btn-entrar");

const btnCadastrar =
    document.getElementById("btn-cadastrar");

const btnSair =
    document.getElementById("btn-sair");

const saudacaoUsuario =
    document.getElementById("saudacao-usuario");

// ========================================
// UTILIDADES
// ========================================

function limparTelefone(telefone) {
    return telefone.replace(/\D/g, "");
}

async function gerarHashPIN(pin) {
    const dados = new TextEncoder().encode(pin);

    const hash = await crypto.subtle.digest(
        "SHA-256",
        dados
    );

    return Array.from(new Uint8Array(hash))
        .map(function (byte) {
            return byte.toString(16).padStart(2, "0");
        })
        .join("");
}

// ========================================
// USUÁRIOS
// ========================================

function obterUsuarios() {
    return JSON.parse(
        localStorage.getItem("marisca_usuarios")
    ) || [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(
        "marisca_usuarios",
        JSON.stringify(usuarios)
    );
}

// ========================================
// ABRIR LOGIN
// ========================================

abrirLogin.addEventListener("click", function () {
    opcoesAcesso.classList.add("oculto");
    formCadastro.classList.add("oculto");
    formLogin.classList.remove("oculto");
});

// ========================================
// ABRIR CADASTRO
// ========================================

abrirCadastro.addEventListener("click", function () {
    opcoesAcesso.classList.add("oculto");
    formLogin.classList.add("oculto");
    formCadastro.classList.remove("oculto");
});

// ========================================
// VOLTAR
// ========================================

voltarLogin.addEventListener(
    "click",
    voltarTelaInicial
);

voltarCadastro.addEventListener(
    "click",
    voltarTelaInicial
);

function voltarTelaInicial() {
    formLogin.classList.add("oculto");
    formCadastro.classList.add("oculto");
    opcoesAcesso.classList.remove("oculto");
}

// ========================================
// CADASTRAR
// ========================================

btnCadastrar.addEventListener("click", async function () {

    const nome = document
        .getElementById("cadastro-nome")
        .value
        .trim();

    const telefone = limparTelefone(
        document.getElementById("cadastro-telefone").value
    );

    const pin = document
        .getElementById("cadastro-pin")
        .value;

    if (!nome || !telefone || !pin) {
        alert("Preencha todos os campos.");
        return;
    }

    if (telefone.length < 10 || telefone.length > 11) {
        alert("Informe um telefone válido com DDD.");
        return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
        alert("O PIN deve ter de 4 a 6 números.");
        return;
    }

    const usuarios = obterUsuarios();

    const usuarioExistente = usuarios.find(function (usuario) {
        return usuario.telefone === telefone;
    });

    if (usuarioExistente) {
        alert("Já existe um perfil com esse telefone.");
        return;
    }

    const pinHash = await gerarHashPIN(pin);

    const novoUsuario = {
        nome: nome,
        telefone: telefone,
        pinHash: pinHash
    };

    usuarios.push(novoUsuario);

    salvarUsuarios(usuarios);

    localStorage.setItem(
        "marisca_usuario_ativo",
        telefone
    );

    abrirAplicativo(novoUsuario);

});

// ========================================
// ENTRAR
// ========================================

btnEntrar.addEventListener("click", async function () {

    const telefone = limparTelefone(
        document.getElementById("login-telefone").value
    );

    const pin = document
        .getElementById("login-pin")
        .value;

    if (!telefone || !pin) {
        alert("Informe seu telefone e PIN.");
        return;
    }

    const usuarios = obterUsuarios();

    const usuario = usuarios.find(function (item) {
        return item.telefone === telefone;
    });

    if (!usuario) {
        alert("Perfil não encontrado.");
        return;
    }

    const pinHash = await gerarHashPIN(pin);

    if (usuario.pinHash !== pinHash) {
        alert("PIN incorreto.");
        return;
    }

    localStorage.setItem(
        "marisca_usuario_ativo",
        telefone
    );

    abrirAplicativo(usuario);

});

// ========================================
// ABRIR MARISCA
// ========================================

function abrirAplicativo(usuario) {
    telaAcesso.classList.add("oculto");
    appPrincipal.classList.remove("oculto");

    saudacaoUsuario.textContent =
        `Olá, ${usuario.nome}!`;

    atualizarPerfilNaTela();
}

// ========================================
// SAIR DO MARISCA
// ========================================

btnSair.addEventListener("click", function () {
    localStorage.removeItem("marisca_usuario_ativo");

    appPrincipal.classList.add("oculto");
    telaAcesso.classList.remove("oculto");

    voltarTelaInicial();
    esconderPaineis();

    document
        .getElementById("painel-perfis")
        .classList.add("oculto");

    window.scrollTo(0, 0);
});

// ========================================
// VERIFICAR SESSÃO AO ABRIR
// ========================================

(function verificarSessao() {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    if (!telefone) return;

    const usuario = obterUsuarios().find(function (item) {
        return item.telefone === telefone;
    });

    if (usuario) {
        abrirAplicativo(usuario);
    }
})();

// ========================================
// CHAVES DE ARMAZENAMENTO
// ========================================

function chavePerfis() {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    return `marisca_perfis_${telefone}`;
}

function chavePerfilAtivo() {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    return `marisca_perfil_ativo_${telefone}`;
}

// ========================================
// OBTER PERFIS DA CONTA
// ========================================

function obterPerfis() {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    if (!telefone) return [];

    const usuario = obterUsuarios().find(function (item) {
        return item.telefone === telefone;
    });

    if (!usuario) return [];

    let perfis = [];

    try {
        perfis = JSON.parse(
            localStorage.getItem(chavePerfis())
        );
    } catch (erro) {
        perfis = [];
    }

    if (!Array.isArray(perfis)) {
        perfis = [];
    }

    // A titular mantém seus registros anteriores.
    const titular = {
        id: "titular",
        nome: usuario.nome
    };

    return [
        titular,
        ...perfis.filter(function (perfil) {
            return (
                perfil &&
                perfil.id !== "titular" &&
                typeof perfil.nome === "string"
            );
        })
    ];
}

// ========================================
// PERFIL SELECIONADO
// ========================================

function obterPerfilAtivo() {
    const perfis = obterPerfis();

    const id = localStorage.getItem(
        chavePerfilAtivo()
    ) || "titular";

    return perfis.find(function (perfil) {
        return perfil.id === id;
    }) || perfis[0] || null;
}

function atualizarPerfilNaTela() {
    const perfil = obterPerfilAtivo();

    document.getElementById(
        "nome-perfil-ativo"
    ).textContent = perfil ? perfil.nome : "—";
}

// ========================================
// CHAVE DOS REGISTROS DE PRODUÇÃO
// ========================================

function chaveProducoes() {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    const perfil = obterPerfilAtivo();

    if (!telefone || !perfil) {
        throw new Error(
            "Selecione um perfil de produção."
        );
    }

    // Mantém a chave original da titular.
    if (perfil.id === "titular") {
        return `producoes_${telefone}`;
    }

    // Cada marisqueira adicional tem sua própria chave.
    return `producoes_${telefone}_perfil_${perfil.id}`;
}

// ========================================
// SELECIONAR MARISQUEIRA
// ========================================

function selecionarPerfil(id) {
    const perfilExiste = obterPerfis().some(
        function (perfil) {
            return perfil.id === id;
        }
    );

    if (!perfilExiste) return;

    localStorage.setItem(
        chavePerfilAtivo(),
        id
    );

    atualizarPerfilNaTela();
    esconderPaineis();

    document
        .getElementById("painel-perfis")
        .classList.add("oculto");

    window.scrollTo(0, 0);
}

// ========================================
// ESCONDER PAINÉIS
// ========================================

function esconderPaineis() {
    const paineis = [
        "form-producao",
        "lista-pendentes",
        "lista-producao",
        "painel-ambiente",
        "painel-grupo"
    ];

    paineis.forEach(function (id) {
        document
            .getElementById(id)
            .classList.add("oculto");
    });
}

// ========================================
// MOSTRAR PERFIS CADASTRADOS
// ========================================

function mostrarPerfis() {
    const lista = document.getElementById(
        "lista-perfis"
    );

    lista.replaceChildren();

    const ativo = obterPerfilAtivo();

    obterPerfis().forEach(function (perfil) {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "botao-perfil";

        botao.textContent =
            perfil.nome +
            (
                perfil.id === ativo?.id
                    ? " ✓ Selecionado"
                    : ""
            );

        botao.addEventListener(
            "click",
            function () {
                selecionarPerfil(perfil.id);
            }
        );

        lista.appendChild(botao);
    });
}


function abrirPerfis() {
    esconderPaineis();
    mostrarPerfis();

    const painel = document.getElementById("painel-perfis");

    painel.classList.remove("oculto");

    painel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

document
    .getElementById("btn-perfis")
    .addEventListener("click", abrirPerfis);

document
    .getElementById("btn-fechar-perfis")
    .addEventListener("click", function () {
        document
            .getElementById("painel-perfis")
            .classList.add("oculto");
    });

// ========================================
// CADASTRAR OUTRA MARISQUEIRA
// ========================================

document
    .getElementById("btn-adicionar-perfil")
    .addEventListener("click", function () {
        const input = document.getElementById(
            "novo-perfil-nome"
        );

        const nome = input.value.trim();

        if (!nome) {
            alert("Informe o nome da marisqueira.");
            return;
        }

        const nomeExistente = obterPerfis().some(
            function (perfil) {
                return (
                    perfil.nome.toLocaleLowerCase("pt-BR") ===
                    nome.toLocaleLowerCase("pt-BR")
                );
            }
        );

        if (nomeExistente) {
            alert(
                "Já existe um perfil com esse nome. " +
                "Use um nome que permita diferenciá-las."
            );
            return;
        }

        const id = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random()
                .toString(36)
                .slice(2)}`;

        const perfisExtras = obterPerfis().filter(
            function (perfil) {
                return perfil.id !== "titular";
            }
        );

        perfisExtras.push({
            id: id,
            nome: nome
        });

        try {
            localStorage.setItem(
                chavePerfis(),
                JSON.stringify(perfisExtras)
            );
        } catch (erro) {
            alert(
                "Não foi possível salvar o perfil neste aparelho."
            );
            return;
        }

        input.value = "";

        mostrarPerfis();

        alert(
            "Perfil cadastrado! Selecione o nome " +
            "para começar a registrar."
        );
    });

// ========================================
// CONSULTAR PRODUÇÕES DE UM PERFIL
// ========================================

function lerProducoesPerfil(perfil) {
    const telefone = localStorage.getItem(
        "marisca_usuario_ativo"
    );

    const chave = perfil.id === "titular"
        ? `producoes_${telefone}`
        : `producoes_${telefone}_perfil_${perfil.id}`;

    try {
        const registros = JSON.parse(
            localStorage.getItem(chave)
        );

        return Array.isArray(registros)
            ? registros
            : [];
    } catch (erro) {
        return [];
    }
}

// ========================================
// RESUMO CONSOLIDADO DO GRUPO
// ========================================

function renderizarGrupo() {
    const dia = document.getElementById(
        "grupo-dia"
    ).value;

    const mes = document.getElementById(
        "grupo-mes"
    ).value;

    const perfis = obterPerfis();

    const formatarNumero = function (numero) {
        return Number(numero).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };

    const formatarDinheiro = function (numero) {
        return Number(numero).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    };

    let caixas = 0;
    let horas = 0;
    let produzidas = 0;
    let vendidas = 0;
    let pendentes = 0;
    let peso = 0;
    let pesoVendido = 0;
    let receita = 0;

    const dias = new Set();
    const linhas = [];

    perfis.forEach(function (perfil) {
        const registros = lerProducoesPerfil(perfil)
            .filter(function (registro) {
                const correspondeDia =
                    !dia || registro.data === dia;

                const correspondeMes =
                    !mes || registro.data?.startsWith(mes);

                return correspondeDia && correspondeMes;
            });

        const subtotal = registros.reduce(
            function (soma, registro) {
                return soma +
                    (Number(registro.receita) || 0);
            },
            0
        );

        linhas.push({
            nome: perfil.nome,
            registros: registros.length,
            receita: subtotal
        });

        registros.forEach(function (registro) {
            caixas += Number(
                registro.quantidadeCaixas
            ) || 0;

            horas += Number(
                registro.horasTrabalho
            ) || 0;

            produzidas += Number(
                registro.sacolasProduzidas
            ) || 0;

            vendidas += Number(
                registro.sacolasVendidas
            ) || 0;

            pendentes += Number(
                registro.sacolasPendentes
            ) || 0;

            peso += Number(
                registro.pesoProduzidoKg
            ) || 0;

            pesoVendido += Number(
                registro.pesoVendidoKg
            ) || 0;

            receita += Number(
                registro.receita
            ) || 0;

            if (registro.data) {
                dias.add(registro.data);
            }
        });
    });

    const destino = document.getElementById(
        "resumo-grupo"
    );

    destino.replaceChildren();

    if (!linhas.some(function (linha) {
        return linha.registros > 0;
    })) {
        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Nenhuma produção encontrada para esse período.";

        destino.appendChild(mensagem);
        return;
    }

    const cartao = document.createElement("div");
    cartao.className = "resumo-producao";

    const titulo = document.createElement("h3");
    titulo.textContent = "Produção coletiva";
    cartao.appendChild(titulo);

    const valores = [
        ["Perfis cadastrados", perfis.length],
        ["Dias com produção", dias.size],
        ["Caixas/galeias", formatarNumero(caixas)],
        ["Horas trabalhadas", formatarNumero(horas)],
        ["Sacolinhas produzidas", formatarNumero(produzidas)],
        ["Peso produzido", `${formatarNumero(peso)} kg`],
        ["Sacolinhas vendidas", formatarNumero(vendidas)],
        ["Sacolinhas pendentes", formatarNumero(pendentes)],
        ["Peso vendido", `${formatarNumero(pesoVendido)} kg`],
        ["Receita registrada", formatarDinheiro(receita)]
    ];

    valores.forEach(function (item) {
        const linha = document.createElement("p");

        const destaque = document.createElement("strong");
        destaque.textContent = `${item[0]}: `;

        linha.append(
            destaque,
            document.createTextNode(String(item[1]))
        );

        cartao.appendChild(linha);
    });

    const subtitulo = document.createElement("h4");
    subtitulo.textContent = "Receita por marisqueira";
    cartao.appendChild(subtitulo);

    linhas.forEach(function (linha) {
        const paragrafo = document.createElement("p");

        paragrafo.textContent =
            `${linha.nome}: ` +
            `${formatarDinheiro(linha.receita)} ` +
            `(${linha.registros} registros)`;

        cartao.appendChild(paragrafo);
    });

    const nota = document.createElement("p");
    nota.className = "fonte-dados";

    nota.textContent =
        "As vendas posteriores são contabilizadas " +
        "no registro da produção original, conforme " +
        "a regra atual do MARISCA.";

    cartao.appendChild(nota);
    destino.appendChild(cartao);
}

// ========================================
// ABRIR RESUMO DO GRUPO
// ========================================

document
    .getElementById("btn-grupo")
    .addEventListener("click", function () {
        esconderPaineis();

        document
            .getElementById("painel-perfis")
            .classList.add("oculto");

        document
            .getElementById("painel-grupo")
            .classList.remove("oculto");

        renderizarGrupo();
    });

document
    .getElementById("btn-fechar-grupo")
    .addEventListener("click", function () {
        document
            .getElementById("painel-grupo")
            .classList.add("oculto");
    });

// ========================================
// FILTROS DO RESUMO DO GRUPO
// ========================================

["grupo-dia", "grupo-mes"].forEach(function (id) {
    document
        .getElementById(id)
        .addEventListener("change", renderizarGrupo);
});

document
    .getElementById("grupo-todas")
    .addEventListener("click", function () {
        document.getElementById("grupo-dia").value = "";
        document.getElementById("grupo-mes").value = "";

        renderizarGrupo();
    });

// ========================================
// ELEMENTOS PRINCIPAIS
// ========================================

const botaoRegistro =
    document.getElementById("btn-registro");

const botaoPendentes =
    document.getElementById("btn-pendentes");

const botaoProducao =
    document.getElementById("btn-producao");

const botaoAmbiente =
    document.getElementById("btn-ambiente");

const formularioProducao =
    document.getElementById("form-producao");

const listaPendentes =
    document.getElementById("lista-pendentes");

const listaProducao =
    document.getElementById("lista-producao");

const painelAmbiente =
    document.getElementById("painel-ambiente");

const botaoSalvar =
    document.getElementById("salvar-producao");

const botaoCancelar =
    document.getElementById("cancelar-producao");

const fecharPendentes =
    document.getElementById("fechar-pendentes");

const fecharProducao =
    document.getElementById("fechar-producao");

const fecharAmbiente =
    document.getElementById("fechar-ambiente");


// ========================================
// CAMPOS DO FORMULÁRIO
// ========================================

const quantidadeCaixas =
    document.getElementById("quantidade-caixas");

const horasTrabalho =
    document.getElementById("horas-trabalho");

const tamanhoSacola =
    document.getElementById("tamanho-sacola");

const campoSacolaOutro =
    document.getElementById("campo-sacola-outro");

const pesoSacolaOutro =
    document.getElementById("peso-sacola-outro");

const sacolasPorCaixa =
    document.getElementById("sacolas-por-caixa");

const vendeuTodas =
    document.getElementById("vendeu-todas");

const campoSobras =
    document.getElementById("campo-sobras");

const sacolasSobraram =
    document.getElementById("sacolas-sobraram");

const precoSacola =
    document.getElementById("preco-sacola");

const resumoCalculado =
    document.getElementById("resumo-calculado");


// ========================================
// ÁREAS DE RESULTADO
// ========================================

const registrosPendentes =
    document.getElementById("registros-pendentes");

const resumosProducao =
    document.getElementById("resumos-producao");

const dadosTempo =
    document.getElementById("dados-tempo");

const dadosMare =
    document.getElementById("dados-mare");


// ========================================
// FILTROS
// ========================================

const filtroDia =
    document.getElementById("filtro-dia");

const filtroMes =
    document.getElementById("filtro-mes");

const mostrarTodas =
    document.getElementById("mostrar-todas");


// ========================================
// ABRIR TELAS
// ========================================

botaoRegistro.addEventListener("click", function () {

    document.getElementById("painel-perfis")
        .classList.add("oculto");

    esconderPaineis();

    formularioProducao.classList.remove("oculto");

});


botaoPendentes.addEventListener("click", function () {

    document.getElementById("painel-perfis")
        .classList.add("oculto");

    esconderPaineis();

    listaPendentes.classList.remove("oculto");

    mostrarPendentes();

});


botaoProducao.addEventListener("click", function () {

    document.getElementById("painel-perfis")
        .classList.add("oculto");

    esconderPaineis();

    listaProducao.classList.remove("oculto");

    mostrarResumo();

});


botaoAmbiente.addEventListener("click", function () {

    document.getElementById("painel-perfis")
        .classList.add("oculto");

    esconderPaineis();

    painelAmbiente.classList.remove("oculto");

    carregarMare();
    carregarTempo();

});


// ========================================
// FECHAR TELAS
// ========================================

botaoCancelar.addEventListener("click", function () {

    formularioProducao.classList.add("oculto");

});


fecharPendentes.addEventListener("click", function () {

    listaPendentes.classList.add("oculto");

});


fecharProducao.addEventListener("click", function () {

    listaProducao.classList.add("oculto");

});


fecharAmbiente.addEventListener("click", function () {

    painelAmbiente.classList.add("oculto");

});


// ========================================
// TAMANHO DA SACOLINHA
// ========================================

tamanhoSacola.addEventListener("change", function () {

    if (tamanhoSacola.value === "outro") {

        campoSacolaOutro.classList.remove("oculto");

    } else {

        campoSacolaOutro.classList.add("oculto");

        pesoSacolaOutro.value = "";

    }

    calcularResumoAutomatico();

});


function obterPesoSacola() {

    if (tamanhoSacola.value === "outro") {

        return Number(pesoSacolaOutro.value) || 0;

    }

    return Number(tamanhoSacola.value) || 0;

}


// ========================================
// VENDEU TODAS?
// ========================================

vendeuTodas.addEventListener("change", function () {

    if (vendeuTodas.value === "nao") {

        campoSobras.classList.remove("oculto");

    } else {

        campoSobras.classList.add("oculto");

        sacolasSobraram.value = "";

    }

    calcularResumoAutomatico();

});


// ========================================
// RECALCULAR AUTOMATICAMENTE
// ========================================

[
    quantidadeCaixas,
    horasTrabalho,
    pesoSacolaOutro,
    sacolasPorCaixa,
    sacolasSobraram,
    precoSacola

].forEach(function (elemento) {

    elemento.addEventListener(
        "input",
        calcularResumoAutomatico
    );

});


// ========================================
// RESUMO AUTOMÁTICO
// ========================================

function calcularResumoAutomatico() {

    const caixas =
        Number(quantidadeCaixas.value) || 0;

    const sacolasCaixa =
        Number(sacolasPorCaixa.value) || 0;

    const preco =
        Number(precoSacola.value) || 0;

    const pesoSacola =
        obterPesoSacola();

    const totalSacolas =
        caixas * sacolasCaixa;

    let quantidadeSobras = 0;

    if (vendeuTodas.value === "nao") {

        quantidadeSobras =
            Number(sacolasSobraram.value) || 0;

    }

    if (quantidadeSobras > totalSacolas) {

        quantidadeSobras = totalSacolas;

    }

    const vendidas =
        totalSacolas - quantidadeSobras;

    const pendentes =
        quantidadeSobras;

    const kgProduzidos =
        (totalSacolas * pesoSacola) / 1000;

    const kgVendidos =
        (vendidas * pesoSacola) / 1000;

    const kgPendentes =
        (pendentes * pesoSacola) / 1000;

    const receita =
        vendidas * preco;

    if (
        caixas === 0 &&
        sacolasCaixa === 0
    ) {

        resumoCalculado.classList.add("oculto");

        return;

    }

    resumoCalculado.innerHTML = `

        <strong>Resumo automático</strong>

        <p>
            🧺 Caixas/galeias trabalhadas:
            ${caixas.toFixed(2)}
        </p>

        <p>
            🛍️ Sacolinhas produzidas:
            ${totalSacolas.toFixed(2)}
        </p>

        <p>
            ⚖️ Produção equivalente:
            ${kgProduzidos.toFixed(2)} kg
        </p>

        <p>
            ✅ Sacolinhas vendidas:
            ${vendidas.toFixed(2)}
        </p>

        <p>
            📦 Sacolinhas pendentes:
            ${pendentes.toFixed(2)}
        </p>

        <p>
            ⚖️ Peso vendido:
            ${kgVendidos.toFixed(2)} kg
        </p>

        <p>
            ⚖️ Peso pendente:
            ${kgPendentes.toFixed(2)} kg
        </p>

        <p>
            💰 Receita desta venda:
            R$ ${receita.toFixed(2)}
        </p>
    `;

    resumoCalculado.classList.remove("oculto");

}


// ========================================
// SALVAR PRODUÇÃO
// ========================================

botaoSalvar.addEventListener("click", function () {

    // Identifica a marisqueira selecionada.

    const perfil = obterPerfilAtivo();

    if (!perfil) {

        alert(
            "Selecione uma marisqueira antes de registrar."
        );

        return;

    }

    // Dados informados no formulário.

    const data =
        document.getElementById("data-producao").value;

    const caixas =
        Number(quantidadeCaixas.value);

    const horas =
        Number(horasTrabalho.value) || 0;

    const pesoSacola =
        obterPesoSacola();

    const sacolasCaixa =
        Number(sacolasPorCaixa.value);

    const preco =
        Number(precoSacola.value) || 0;

    const observacao =
        document.getElementById("observacao-producao")
            .value;

    // Validação dos campos obrigatórios.

    if (
        !data ||
        !Number.isFinite(caixas) ||
        caixas <= 0 ||
        !Number.isFinite(pesoSacola) ||
        pesoSacola <= 0 ||
        !Number.isFinite(sacolasCaixa) ||
        sacolasCaixa <= 0
    ) {

        alert(
            "Preencha corretamente a data, as caixas/galeias, " +
            "o tamanho da sacolinha e as sacolinhas por caixa."
        );

        return;

    }

    if (
        !Number.isFinite(horas) ||
        horas < 0 ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {

        alert(
            "As horas trabalhadas e o preço não podem ser negativos."
        );

        return;

    }

    if (!vendeuTodas.value) {

        alert(
            "Informe se todas as sacolinhas foram vendidas."
        );

        return;

    }

    const totalSacolas =
        caixas * sacolasCaixa;

    let quantidadeSobras = 0;

    if (vendeuTodas.value === "nao") {

        if (sacolasSobraram.value === "") {

            alert(
                "Informe quantas sacolinhas sobraram."
            );

            return;

        }

        quantidadeSobras =
            Number(sacolasSobraram.value);

    }

    if (
        !Number.isFinite(quantidadeSobras) ||
        quantidadeSobras < 0 ||
        quantidadeSobras > totalSacolas
    ) {

        alert(
            "A quantidade de sacolinhas restantes " +
            "deve estar entre zero e o total produzido."
        );

        return;

    }

    // Cálculos de produção e comercialização.

    const vendidasAgora =
        totalSacolas - quantidadeSobras;

    const pendentes =
        quantidadeSobras;

    const pesoProduzidoKg =
        (totalSacolas * pesoSacola) / 1000;

    const pesoVendidoKg =
        (vendidasAgora * pesoSacola) / 1000;

    const pesoPendenteKg =
        (pendentes * pesoSacola) / 1000;

    const receitaInicial =
        vendidasAgora * preco;

    // Registro individual de produção.

    const registro = {

        id: Date.now(),

        data,

        quantidadeCaixas: caixas,

        horasTrabalho: horas,

        pesoSacola,

        sacolasPorCaixa: sacolasCaixa,

        sacolasProduzidas: totalSacolas,

        pesoProduzidoKg,

        vendeuTodas: vendeuTodas.value,

        quantidadeSobras,

        sacolasVendidas: vendidasAgora,

        sacolasPendentes: pendentes,

        pesoVendidoKg,

        pesoPendenteKg,

        precoSacola: preco,

        receita: receitaInicial,

        vendasPosteriores: [],

        observacao

    };

    // A função chaveProducoes() utiliza
    // o perfil selecionado na Parte 2.

    const chave = chaveProducoes();

    let producoes;

    try {

        producoes = JSON.parse(
            localStorage.getItem(chave)
        ) || [];

        if (!Array.isArray(producoes)) {
            throw new Error("Dados de produção inválidos.");
        }

    } catch (erro) {

        alert(
            "Não foi possível ler os registros anteriores. " +
            "Nenhum dado foi substituído."
        );

        return;

    }

    producoes.push(registro);

    try {

        localStorage.setItem(
            chave,
            JSON.stringify(producoes)
        );

    } catch (erro) {

        alert(
            "Não foi possível salvar a produção neste aparelho."
        );

        return;

    }

    alert(
        `Produção de ${perfil.nome} registrada com sucesso!`
    );

    limparFormulario();

    formularioProducao.classList.add("oculto");

});

// ========================================
// PARTE 4 — VENDAS PENDENTES
// ========================================

// Formatação de valores para exibição.

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function formatarQuantidade(valor) {
    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}

function formatarDataProducao(data) {
    if (!data || typeof data !== "string") {
        return "Data não informada";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ========================================
// LER PRODUÇÕES DO PERFIL ATIVO
// ========================================

function obterProducoes() {
    const chave = chaveProducoes();

    const conteudo = localStorage.getItem(chave);

    if (conteudo === null) {
        return [];
    }

    const producoes = JSON.parse(conteudo);

    if (!Array.isArray(producoes)) {
        throw new Error(
            "Os registros de produção estão em formato inválido."
        );
    }

    return producoes;
}

// ========================================
// SALVAR PRODUÇÕES DO PERFIL ATIVO
// ========================================

function salvarProducoes(producoes) {
    if (!Array.isArray(producoes)) {
        throw new Error(
            "Os dados de produção devem ser uma lista."
        );
    }

    localStorage.setItem(
        chaveProducoes(),
        JSON.stringify(producoes)
    );
}

// ========================================
// EXIBIR VENDAS PENDENTES
// ========================================

function mostrarPendentes() {
    const destino = document.getElementById(
        "registros-pendentes"
    );

    destino.replaceChildren();

    const perfil = obterPerfilAtivo();

    if (!perfil) {
        destino.textContent =
            "Selecione uma marisqueira para consultar as vendas.";
        return;
    }

    let producoes;

    try {
        producoes = obterProducoes();
    } catch (erro) {
        destino.textContent =
            "Não foi possível ler as produções salvas. " +
            "Os registros existentes não foram alterados.";
        return;
    }

    const pendentes = producoes.filter(function (registro) {
        return Number(registro.sacolasPendentes) > 0;
    });

    const titulo = document.createElement("p");

    const destaque = document.createElement("strong");
    destaque.textContent = `Marisqueira: ${perfil.nome}`;

    titulo.appendChild(destaque);
    destino.appendChild(titulo);

    if (pendentes.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Não há vendas pendentes para esta marisqueira.";

        destino.appendChild(mensagem);
        return;
    }

    pendentes.sort(function (a, b) {
        return String(b.data || "").localeCompare(
            String(a.data || "")
        );
    });

    pendentes.forEach(function (registro) {
        const cartao = document.createElement("div");

        cartao.className = "resumo-producao";

        const cabecalho = document.createElement("h3");
        cabecalho.textContent =
            `Produção de ${formatarDataProducao(registro.data)}`;

        cartao.appendChild(cabecalho);

        const informacoes = [
            [
                "Sacolinhas produzidas",
                formatarQuantidade(registro.sacolasProduzidas)
            ],
            [
                "Sacolinhas já vendidas",
                formatarQuantidade(registro.sacolasVendidas)
            ],
            [
                "Sacolinhas pendentes",
                formatarQuantidade(registro.sacolasPendentes)
            ],
            [
                "Peso pendente",
                `${formatarQuantidade(registro.pesoPendenteKg)} kg`
            ],
            [
                "Receita acumulada",
                formatarMoeda(registro.receita)
            ]
        ];

        informacoes.forEach(function (informacao) {
            const linha = document.createElement("p");
            const rotulo = document.createElement("strong");

            rotulo.textContent = `${informacao[0]}: `;

            linha.append(
                rotulo,
                document.createTextNode(informacao[1])
            );

            cartao.appendChild(linha);
        });

        // Campo para informar uma nova venda.

        const tituloVenda = document.createElement("h4");
        tituloVenda.textContent = "Registrar nova venda";

        cartao.appendChild(tituloVenda);

        const idQuantidade =
            `venda-quantidade-${registro.id}`;

        const idPreco =
            `venda-preco-${registro.id}`;

        const idData =
            `venda-data-${registro.id}`;

        const labelQuantidade = document.createElement("label");
        labelQuantidade.htmlFor = idQuantidade;
        labelQuantidade.textContent =
            "Quantas sacolinhas foram vendidas?";

        const inputQuantidade = document.createElement("input");

        inputQuantidade.type = "number";
        inputQuantidade.id = idQuantidade;
        inputQuantidade.min = "0";
        inputQuantidade.step = "1";
        inputQuantidade.max = String(
            registro.sacolasPendentes
        );
        inputQuantidade.placeholder =
            "Quantidade vendida";

        const labelPreco = document.createElement("label");
        labelPreco.htmlFor = idPreco;
        labelPreco.textContent =
            "Preço de cada sacolinha (R$)";

        const inputPreco = document.createElement("input");

        inputPreco.type = "number";
        inputPreco.id = idPreco;
        inputPreco.min = "0";
        inputPreco.step = "0.01";
        inputPreco.placeholder = "Ex.: 10,00";

        if (
            Number.isFinite(Number(registro.precoSacola)) &&
            Number(registro.precoSacola) >= 0
        ) {
            inputPreco.value = String(
                registro.precoSacola
            );
        }

        const labelData = document.createElement("label");
        labelData.htmlFor = idData;
        labelData.textContent =
            "Data da venda";

        const inputData = document.createElement("input");

        inputData.type = "date";
        inputData.id = idData;

        const agora = new Date();

        const ano = agora.getFullYear();
        const mes = String(
            agora.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            agora.getDate()
        ).padStart(2, "0");

        inputData.value = `${ano}-${mes}-${dia}`;

        const botaoVenda = document.createElement("button");

        botaoVenda.type = "button";
        botaoVenda.textContent = "Registrar venda";

        botaoVenda.addEventListener(
            "click",
            function () {
                registrarVendaPosterior(
                    registro.id,
                    inputQuantidade.value,
                    inputPreco.value,
                    inputData.value
                );
            }
        );

        cartao.append(
            labelQuantidade,
            inputQuantidade,
            labelPreco,
            inputPreco,
            labelData,
            inputData,
            botaoVenda
        );

        destino.appendChild(cartao);
    });
}

// ========================================
// REGISTRAR UMA VENDA POSTERIOR
// ========================================

function registrarVendaPosterior(
    idRegistro,
    quantidadeInformada,
    precoInformado,
    dataVenda
) {
    const perfil = obterPerfilAtivo();

    if (!perfil) {
        alert("Selecione uma marisqueira.");
        return;
    }

    // Validação dos valores informados.

    if (
        quantidadeInformada === "" ||
        precoInformado === "" ||
        !dataVenda
    ) {
        alert(
            "Informe a quantidade, o preço e a data da venda."
        );
        return;
    }

    const quantidade = Number(quantidadeInformada);
    const preco = Number(precoInformado);

    if (
        !Number.isSafeInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert(
            "Informe uma quantidade inteira de sacolinhas, maior que zero."
        );
        return;
    }

    if (
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        alert(
            "Informe um preço válido, igual ou maior que zero."
        );
        return;
    }

    let producoes;

    try {
        producoes = obterProducoes();
    } catch (erro) {
        alert(
            "Não foi possível consultar os registros anteriores."
        );
        return;
    }

    const registro = producoes.find(function (item) {
        return String(item.id) === String(idRegistro);
    });

    if (!registro) {
        alert(
            "O registro de produção não foi encontrado."
        );
        return;
    }

    const quantidadePendente =
        Number(registro.sacolasPendentes);

    if (
        !Number.isFinite(quantidadePendente) ||
        quantidadePendente <= 0
    ) {
        alert(
            "Esta produção não possui sacolinhas pendentes."
        );
        return;
    }

    if (quantidade > quantidadePendente) {
        alert(
            "A quantidade vendida não pode ultrapassar " +
            "as sacolinhas pendentes."
        );
        return;
    }

    if (
        typeof registro.data === "string" &&
        dataVenda < registro.data
    ) {
        alert(
            "A data da venda não pode ser anterior " +
            "à data da produção."
        );
        return;
    }

    const pesoSacola =
        Number(registro.pesoSacola) || 0;

    const pesoVendidoAgora =
        (quantidade * pesoSacola) / 1000;

    const receitaVenda =
        quantidade * preco;

    // Atualiza as quantidades acumuladas.

    registro.sacolasVendidas =
        (Number(registro.sacolasVendidas) || 0) +
        quantidade;

    registro.sacolasPendentes =
        quantidadePendente - quantidade;

    registro.pesoVendidoKg =
        (Number(registro.pesoVendidoKg) || 0) +
        pesoVendidoAgora;

    registro.pesoPendenteKg =
        (registro.sacolasPendentes * pesoSacola) / 1000;

    registro.receita =
        (Number(registro.receita) || 0) +
        receitaVenda;

    // Guarda o histórico das vendas posteriores.

    if (!Array.isArray(registro.vendasPosteriores)) {
        registro.vendasPosteriores = [];
    }

    registro.vendasPosteriores.push({
        id: Date.now(),
        data: dataVenda,
        quantidade: quantidade,
        precoSacola: preco,
        pesoVendidoKg: pesoVendidoAgora,
        receita: receitaVenda
    });

    // Salva no armazenamento exclusivo do perfil.

    try {
        salvarProducoes(producoes);
    } catch (erro) {
        alert(
            "Não foi possível salvar a venda. " +
            "Confira o armazenamento deste aparelho."
        );
        return;
    }

    alert(
        `Venda de ${formatarQuantidade(quantidade)} ` +
        `sacolinha(s) registrada para ${perfil.nome}!\n` +
        `Valor: ${formatarMoeda(receitaVenda)}`
    );

    mostrarPendentes();
}

// ========================================
// PARTE 5 — RESUMOS INDIVIDUAIS
// ========================================

// ========================================
// FILTRAR REGISTROS POR DATA
// ========================================

function filtrarProducoesPorPeriodo(producoes) {
    const dia = filtroDia.value;
    const mes = filtroMes.value;

    return producoes.filter(function (registro) {
        const data = String(registro.data || "");

        const correspondeDia =
            !dia || data === dia;

        const correspondeMes =
            !mes || data.startsWith(mes);

        return correspondeDia && correspondeMes;
    });
}

// ========================================
// CALCULAR INDICADORES DE PRODUÇÃO
// ========================================

function calcularIndicadoresProducao(registros) {
    const totais = {
        registros: registros.length,
        caixas: 0,
        horas: 0,
        sacolasProduzidas: 0,
        sacolasVendidas: 0,
        sacolasPendentes: 0,
        pesoProduzidoKg: 0,
        pesoVendidoKg: 0,
        pesoPendenteKg: 0,
        receita: 0,
        vendasPosteriores: 0,
        quantidadeVendasPosteriores: 0
    };

    const dias = new Set();
    const meses = new Set();

    registros.forEach(function (registro) {
        const data = String(registro.data || "");

        if (data) {
            dias.add(data);
            meses.add(data.slice(0, 7));
        }

        totais.caixas +=
            Number(registro.quantidadeCaixas) || 0;

        totais.horas +=
            Number(registro.horasTrabalho) || 0;

        totais.sacolasProduzidas +=
            Number(registro.sacolasProduzidas) || 0;

        totais.sacolasVendidas +=
            Number(registro.sacolasVendidas) || 0;

        totais.sacolasPendentes +=
            Number(registro.sacolasPendentes) || 0;

        totais.pesoProduzidoKg +=
            Number(registro.pesoProduzidoKg) || 0;

        totais.pesoVendidoKg +=
            Number(registro.pesoVendidoKg) || 0;

        totais.pesoPendenteKg +=
            Number(registro.pesoPendenteKg) || 0;

        totais.receita +=
            Number(registro.receita) || 0;

        if (Array.isArray(registro.vendasPosteriores)) {
            registro.vendasPosteriores.forEach(
                function (venda) {
                    totais.vendasPosteriores +=
                        Number(venda.receita) || 0;

                    totais.quantidadeVendasPosteriores +=
                        Number(venda.quantidade) || 0;
                }
            );
        }
    });

    totais.diasTrabalhados = dias.size;
    totais.mesesComProducao = meses.size;

    totais.mediaCaixasPorDia =
        dias.size > 0
            ? totais.caixas / dias.size
            : 0;

    totais.mediaHorasPorDia =
        dias.size > 0
            ? totais.horas / dias.size
            : 0;

    totais.mediaSacolasPorDia =
        dias.size > 0
            ? totais.sacolasProduzidas / dias.size
            : 0;

    totais.mediaReceitaPorDia =
        dias.size > 0
            ? totais.receita / dias.size
            : 0;

    totais.mediaReceitaPorMes =
        meses.size > 0
            ? totais.receita / meses.size
            : 0;

    return totais;
}

// ========================================
// CRIAR LINHAS DE RESULTADO
// ========================================

function criarLinhaResumo(rotulo, valor) {
    const linha = document.createElement("p");

    const destaque = document.createElement("strong");
    destaque.textContent = `${rotulo}: `;

    linha.append(
        destaque,
        document.createTextNode(String(valor))
    );

    return linha;
}

// ========================================
// MOSTRAR RESUMO INDIVIDUAL
// ========================================

function mostrarResumo() {
    const destino = document.getElementById(
        "resumos-producao"
    );

    destino.replaceChildren();

    const perfil = obterPerfilAtivo();

    if (!perfil) {
        destino.textContent =
            "Selecione uma marisqueira para consultar a produção.";
        return;
    }

    let producoes;

    try {
        producoes = obterProducoes();
    } catch (erro) {
        destino.textContent =
            "Não foi possível consultar as produções salvas. " +
            "Nenhum registro foi alterado.";
        return;
    }

    const registros = filtrarProducoesPorPeriodo(
        producoes
    );

    const identificacao = document.createElement("p");

    identificacao.appendChild(
        criarLinhaResumo(
            "Marisqueira",
            perfil.nome
        )
    );

    destino.appendChild(identificacao);

    if (registros.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Nenhuma produção encontrada para o período selecionado.";

        destino.appendChild(mensagem);
        return;
    }

    const totais = calcularIndicadoresProducao(
        registros
    );

    // ========================================
    // CARTÃO DE RESULTADOS GERAIS
    // ========================================

    const cartao = document.createElement("div");
    cartao.className = "resumo-producao";

    const titulo = document.createElement("h3");
    titulo.textContent = "Resumo da produção";

    cartao.appendChild(titulo);

    const indicadores = [
        ["Registros de produção", totais.registros],
        ["Dias com produção", totais.diasTrabalhados],
        ["Caixas/galeias trabalhadas",
            formatarQuantidade(totais.caixas)],
        ["Horas trabalhadas",
            formatarQuantidade(totais.horas)],
        ["Sacolinhas produzidas",
            formatarQuantidade(totais.sacolasProduzidas)],
        ["Peso produzido",
            `${formatarQuantidade(totais.pesoProduzidoKg)} kg`],
        ["Sacolinhas vendidas",
            formatarQuantidade(totais.sacolasVendidas)],
        ["Peso vendido",
            `${formatarQuantidade(totais.pesoVendidoKg)} kg`],
        ["Sacolinhas pendentes",
            formatarQuantidade(totais.sacolasPendentes)],
        ["Peso pendente",
            `${formatarQuantidade(totais.pesoPendenteKg)} kg`],
        ["Receita registrada",
            formatarMoeda(totais.receita)]
    ];

    indicadores.forEach(function (indicador) {
        cartao.appendChild(
            criarLinhaResumo(
                indicador[0],
                indicador[1]
            )
        );
    });

    // ========================================
    // MÉDIAS DE PRODUÇÃO
    // ========================================

    const tituloMedias = document.createElement("h4");
    tituloMedias.textContent = "Médias de produção";

    cartao.appendChild(tituloMedias);

    const medias = [
        [
            "Caixas/galeias por dia de produção",
            formatarQuantidade(totais.mediaCaixasPorDia)
        ],
        [
            "Horas por dia de produção",
            formatarQuantidade(totais.mediaHorasPorDia)
        ],
        [
            "Sacolinhas por dia de produção",
            formatarQuantidade(totais.mediaSacolasPorDia)
        ],
        [
            "Receita por dia de produção",
            formatarMoeda(totais.mediaReceitaPorDia)
        ],
        [
            "Receita por mês com produção",
            formatarMoeda(totais.mediaReceitaPorMes)
        ]
    ];

    medias.forEach(function (media) {
        cartao.appendChild(
            criarLinhaResumo(
                media[0],
                media[1]
            )
        );
    });

    // ========================================
    // VENDAS POSTERIORES
    // ========================================

    const tituloVendas = document.createElement("h4");
    tituloVendas.textContent = "Vendas posteriores";

    cartao.appendChild(tituloVendas);

    cartao.appendChild(
        criarLinhaResumo(
            "Sacolinhas vendidas posteriormente",
            formatarQuantidade(
                totais.quantidadeVendasPosteriores
            )
        )
    );

    cartao.appendChild(
        criarLinhaResumo(
            "Receita das vendas posteriores",
            formatarMoeda(totais.vendasPosteriores)
        )
    );

    const observacao = document.createElement("p");
    observacao.className = "fonte-dados";

    observacao.textContent =
        "As vendas posteriores já estão incluídas na " +
        "receita total. Seus valores não devem ser " +
        "somados novamente ao total apresentado.";

    cartao.appendChild(observacao);

    destino.appendChild(cartao);

    // ========================================
    // HISTÓRICO DE PRODUÇÕES
    // ========================================

    const tituloHistorico = document.createElement("h3");
    tituloHistorico.textContent = "Histórico de produções";

    destino.appendChild(tituloHistorico);

    const registrosOrdenados = [...registros].sort(
        function (a, b) {
            return String(b.data || "").localeCompare(
                String(a.data || "")
            );
        }
    );

    registrosOrdenados.forEach(function (registro) {
        const cartaoRegistro = document.createElement("div");

        cartaoRegistro.className = "resumo-producao";

        const tituloRegistro = document.createElement("h4");

        tituloRegistro.textContent =
            `Produção de ${formatarDataProducao(registro.data)}`;

        cartaoRegistro.appendChild(tituloRegistro);

        const detalhes = [
            [
                "Caixas/galeias",
                formatarQuantidade(registro.quantidadeCaixas)
            ],
            [
                "Horas trabalhadas",
                formatarQuantidade(registro.horasTrabalho)
            ],
            [
                "Sacolinhas produzidas",
                formatarQuantidade(registro.sacolasProduzidas)
            ],
            [
                "Peso produzido",
                `${formatarQuantidade(registro.pesoProduzidoKg)} kg`
            ],
            [
                "Sacolinhas vendidas",
                formatarQuantidade(registro.sacolasVendidas)
            ],
            [
                "Sacolinhas pendentes",
                formatarQuantidade(registro.sacolasPendentes)
            ],
            [
                "Receita acumulada",
                formatarMoeda(registro.receita)
            ]
        ];

        detalhes.forEach(function (detalhe) {
            cartaoRegistro.appendChild(
                criarLinhaResumo(
                    detalhe[0],
                    detalhe[1]
                )
            );
        });

        if (registro.observacao) {
            cartaoRegistro.appendChild(
                criarLinhaResumo(
                    "Observação",
                    registro.observacao
                )
            );
        }

        if (
            Array.isArray(registro.vendasPosteriores) &&
            registro.vendasPosteriores.length > 0
        ) {
            const subtitulo = document.createElement("h4");

            subtitulo.textContent =
                "Vendas realizadas posteriormente";

            cartaoRegistro.appendChild(subtitulo);

            registro.vendasPosteriores.forEach(
                function (venda) {
                    const texto = document.createElement("p");

                    texto.textContent =
                        `${formatarDataProducao(venda.data)} — ` +
                        `${formatarQuantidade(venda.quantidade)} ` +
                        `sacolinha(s) — ` +
                        `${formatarMoeda(venda.receita)}`;

                    cartaoRegistro.appendChild(texto);
                }
            );
        }

        destino.appendChild(cartaoRegistro);
    });
}

// ========================================
// FILTRO POR DIA
// ========================================

filtroDia.addEventListener("change", function () {
    mostrarResumo();
});

// ========================================
// FILTRO POR MÊS
// ========================================

filtroMes.addEventListener("change", function () {
    mostrarResumo();
});

// ========================================
// MOSTRAR TODA A PRODUÇÃO
// ========================================

mostrarTodas.addEventListener("click", function () {
    filtroDia.value = "";
    filtroMes.value = "";

    mostrarResumo();
});

// ========================================
// PARTE 6 — MARÉ, TEMPO E FINALIZAÇÃO
// ========================================

// Coordenadas aproximadas de Porto de Santana,
// Cariacica, Espírito Santo.

const LATITUDE_MARISCA = -20.34;
const LONGITUDE_MARISCA = -40.38;

// ========================================
// DATA LOCAL
// ========================================

function obterDataLocal() {
    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// ========================================
// HORÁRIO LOCAL
// ========================================

function obterHoraLocal() {
    const agora = new Date();

    return String(
        agora.getHours()
    ).padStart(2, "0");
}

// ========================================
// PROBABILIDADE DE CHUVA
// ========================================

function obterProbabilidadeAtual(dados) {
    if (
        !dados ||
        !dados.hourly ||
        !Array.isArray(dados.hourly.time) ||
        !Array.isArray(
            dados.hourly.precipitation_probability
        )
    ) {
        return null;
    }

    const horarioAtual =
        `${obterDataLocal()}T${obterHoraLocal()}:00`;

    const indice = dados.hourly.time.indexOf(
        horarioAtual
    );

    if (indice === -1) {
        return null;
    }

    return dados.hourly
        .precipitation_probability[indice];
}

// ========================================
// CLASSIFICAÇÃO DO TEMPO
// ========================================

function descreverTempo(codigo) {
    const numero = Number(codigo);

    if (numero === 0) {
        return "Céu limpo";
    }

    if ([1, 2, 3].includes(numero)) {
        return "Céu parcialmente nublado";
    }

    if ([45, 48].includes(numero)) {
        return "Neblina";
    }

    if (
        [51, 53, 55, 56, 57].includes(numero)
    ) {
        return "Garoa";
    }

    if (
        [61, 63, 65, 66, 67].includes(numero)
    ) {
        return "Chuva";
    }

    if (
        [71, 73, 75, 77].includes(numero)
    ) {
        return "Neve";
    }

    if (
        [80, 81, 82].includes(numero)
    ) {
        return "Pancadas de chuva";
    }

    if (
        [95, 96, 99].includes(numero)
    ) {
        return "Trovoadas";
    }

    return "Condição não informada";
}

// ========================================
// CONSULTAR PREVISÃO DO TEMPO
// ========================================

async function carregarTempo() {
    const destino = document.getElementById(
        "dados-tempo"
    );

    destino.replaceChildren();

    const carregando = document.createElement("p");

    carregando.textContent =
        "Consultando a previsão do tempo...";

    destino.appendChild(carregando);

    const parametros = new URLSearchParams({
        latitude: String(LATITUDE_MARISCA),
        longitude: String(LONGITUDE_MARISCA),
        current:
            "temperature_2m,precipitation,wind_speed_10m,weather_code",
        hourly:
            "precipitation_probability",
        timezone:
            "America/Sao_Paulo",
        forecast_days:
            "1"
    });

    const endereco =
        "https://api.open-meteo.com/v1/forecast?" +
        parametros.toString();

    try {
        const resposta = await fetch(endereco);

        if (!resposta.ok) {
            throw new Error(
                "Falha ao consultar a previsão."
            );
        }

        const dados = await resposta.json();

        if (!dados.current) {
            throw new Error(
                "A previsão retornou dados incompletos."
            );
        }

        destino.replaceChildren();

        const cartao = document.createElement("div");

        cartao.className = "card-ambiente";

        const titulo = document.createElement("h3");

        titulo.textContent = "🌦️ Tempo agora";

        cartao.appendChild(titulo);

        const temperatura =
            dados.current.temperature_2m;

        const precipitacao =
            dados.current.precipitation;

        const vento =
            dados.current.wind_speed_10m;

        const condicao = descreverTempo(
            dados.current.weather_code
        );

        const probabilidade =
            obterProbabilidadeAtual(dados);

        const informacoes = [
            [
                "Condição",
                condicao
            ],
            [
                "Temperatura",
                temperatura == null
                    ? "Não disponível"
                    : `${formatarQuantidade(temperatura)} °C`
            ],
            [
                "Chuva registrada",
                precipitacao == null
                    ? "Não disponível"
                    : `${formatarQuantidade(precipitacao)} mm`
            ],
            [
                "Velocidade do vento",
                vento == null
                    ? "Não disponível"
                    : `${formatarQuantidade(vento)} km/h`
            ],
            [
                "Probabilidade de chuva",
                probabilidade == null
                    ? "Não disponível"
                    : `${formatarQuantidade(probabilidade)}%`
            ]
        ];

        informacoes.forEach(function (informacao) {
            cartao.appendChild(
                criarLinhaResumo(
                    informacao[0],
                    informacao[1]
                )
            );
        });

        const fonte = document.createElement("p");

        fonte.className = "fonte-dados";

        fonte.textContent =
            "Fonte: Open-Meteo. Previsão aproximada " +
            "para a região de Porto de Santana.";

        cartao.appendChild(fonte);

        destino.appendChild(cartao);

    } catch (erro) {
        destino.replaceChildren();

        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Não foi possível carregar a previsão " +
            "do tempo neste momento.";

        destino.appendChild(mensagem);

        console.error(
            "Erro na previsão do tempo:",
            erro
        );
    }
}

// ========================================
// INTERPRETAR HORÁRIOS DA MARÉ
// ========================================

function formatarHorarioMare(valor) {
    if (valor == null) {
        return "—";
    }

    return String(valor);
}

// ========================================
// IDENTIFICAR REGISTRO DO DIA
// ========================================

function localizarMareDoDia(dados, data) {
    if (Array.isArray(dados)) {
        return dados.find(function (registro) {
            return registro.data === data;
        }) || null;
    }

    if (
        dados &&
        typeof dados === "object"
    ) {
        if (Array.isArray(dados.mares)) {
            return localizarMareDoDia(
                dados.mares,
                data
            );
        }

        if (Array.isArray(dados.dias)) {
            return localizarMareDoDia(
                dados.dias,
                data
            );
        }

        if (dados[data]) {
            return dados[data];
        }
    }

    return null;
}

// ========================================
// MOSTRAR EVENTOS DE MARÉ
// ========================================

function extrairEventosMare(registro) {
    if (!registro) {
        return [];
    }

    if (Array.isArray(registro.eventos)) {
        return registro.eventos;
    }

    if (Array.isArray(registro.mares)) {
        return registro.mares;
    }

    if (Array.isArray(registro.horarios)) {
        return registro.horarios;
    }

    return [];
}

// ========================================
// CONSULTAR TÁBUA DE MARÉS
// ========================================

async function carregarMare() {
    const destino = document.getElementById(
        "dados-mare"
    );

    destino.replaceChildren();

    const carregando = document.createElement("p");

    carregando.textContent =
        "Consultando a tábua de marés...";

    destino.appendChild(carregando);

    try {
        const resposta = await fetch(
            "mares-2026.json",
            {
                cache: "no-store"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                "Arquivo de marés indisponível."
            );
        }

        const dados = await resposta.json();

        const dataAtual = obterDataLocal();

        const registro = localizarMareDoDia(
            dados,
            dataAtual
        );

        destino.replaceChildren();

        const cartao = document.createElement("div");

        cartao.className = "card-ambiente";

        const titulo = document.createElement("h3");

        titulo.textContent = "🌊 Marés de hoje";

        cartao.appendChild(titulo);

        const dataTexto = document.createElement("p");

        dataTexto.textContent =
            formatarDataProducao(dataAtual);

        cartao.appendChild(dataTexto);

        if (!registro) {
            const mensagem = document.createElement("p");

            mensagem.textContent =
                "Não há informações de maré " +
                "disponíveis para esta data.";

            cartao.appendChild(mensagem);

        } else {
            const eventos = extrairEventosMare(
                registro
            );

            if (eventos.length === 0) {
                const mensagem = document.createElement("p");

                mensagem.textContent =
                    "O registro foi encontrado, mas " +
                    "não foi possível identificar os horários.";

                cartao.appendChild(mensagem);

            } else {
                eventos.forEach(function (evento) {
                    const linha = document.createElement("div");

                    linha.className = "linha-mare";

                    const tipo = document.createElement("span");

                    tipo.textContent =
                        evento.tipo ||
                        evento.classificacao ||
                        "Maré";

                    const horario = document.createElement("strong");

                    horario.textContent =
                        formatarHorarioMare(
                            evento.hora ||
                            evento.horario
                        );

                    const altura = document.createElement("span");

                    const valorAltura =
                        evento.altura ??
                        evento.altura_m ??
                        null;

                    altura.textContent =
                        valorAltura == null
                            ? "—"
                            : `${valorAltura} m`;

                    linha.append(
                        tipo,
                        horario,
                        altura
                    );

                    cartao.appendChild(linha);
                });
            }
        }

        const fonte = document.createElement("p");

        fonte.className = "fonte-dados";

        fonte.textContent =
            "Fonte dos dados de maré: Marinha do Brasil, " +
            "Centro de Hidrografia da Marinha (CHM), " +
            "Porto de Vitória.";

        cartao.appendChild(fonte);

        destino.appendChild(cartao);

    } catch (erro) {
        destino.replaceChildren();

        const mensagem = document.createElement("p");

        mensagem.textContent =
            "Não foi possível carregar a tábua " +
            "de marés neste momento.";

        destino.appendChild(mensagem);

        console.error(
            "Erro ao carregar as marés:",
            erro
        );
    }
}

// ========================================
// LIMPAR FORMULÁRIO DE PRODUÇÃO
// ========================================

function limparFormulario() {
    document.getElementById(
        "data-producao"
    ).value = obterDataLocal();

    quantidadeCaixas.value = "";

    horasTrabalho.value = "";

    tamanhoSacola.value = "";

    pesoSacolaOutro.value = "";

    sacolasPorCaixa.value = "";

    vendeuTodas.value = "";

    sacolasSobraram.value = "";

    precoSacola.value = "";

    document.getElementById(
        "observacao-producao"
    ).value = "";

    campoSacolaOutro.classList.add("oculto");

    campoSobras.classList.add("oculto");

    resumoCalculado.classList.add("oculto");

    resumoCalculado.replaceChildren();
}

// ========================================
// INICIALIZAÇÃO DO FORMULÁRIO
// ========================================

document.getElementById(
    "data-producao"
).value = obterDataLocal();

// ========================================
// FIM DO APP.JS
// ========================================
