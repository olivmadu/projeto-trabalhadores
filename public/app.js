//Importando módulos do Firebase 
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";

import { 
    getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAgR2okrqMeGeZ_X6bcz8UC6W0cXBvlFqA",
    authDomain: "ambiental-6ad97.firebaseapp.com",
    projectId: "ambiental-6ad97",
    storageBucket: "ambiental-6ad97.firebasestorage.app",
    messagingSenderId: "1061977307361",
    appId: "1:1061977307361:web:1fbb68d06a86c0eeaa9fa0",
    measurementId: "G-54QF1PRNXR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Arrays para armazenar treinamentos básicos e continuados
let basicos = [];
let continuados = [];



// ---------------------- EMPRESAS ---------------------- //
async function adicionarEmpresa(nome) {
    try {
        const q = query(collection(db, "empresas"), where("nome", "==", nome));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            mostrarMensagemErro("Já existe uma empresa cadastrada com este nome.");
            return;
        }

        const docRef = await addDoc(collection(db, "empresas"), { nome });
        console.log("Empresa cadastrada com sucesso! ID:", docRef.id);
        mostrarMensagemSucesso("Empresa cadastrada com sucesso!");
        carregarEmpresas();
    } catch (error) {
        console.error("Erro ao cadastrar empresa:", error);
        mostrarMensagemErro("Erro ao cadastrar empresa.");
    }
}

async function carregarEmpresas() {
    const tabelaContainer = document.getElementById("tabela-empresas");
    if (!tabelaContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "empresas"));
        const tbody = tabelaContainer.querySelector("tbody");
        tbody.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const empresa = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${doc.id}</td>
                <td>
                    <a href="empresa.html?id=${doc.id}" class="link-empresa">${empresa.nome}</a>
                </td>
                <td><button class="btn-excluir" data-id="${doc.id}">Excluir</button></td>
            `;
            tbody.appendChild(tr);

            const btnExcluir = tr.querySelector(".btn-excluir");
            btnExcluir.addEventListener("click", async () => {
                if (confirm("Deseja realmente excluir esta empresa?")) {
                    await excluirEmpresa(doc.id);
                    carregarEmpresas();
                }
            });
        });
    } catch (error) {
        console.error("Erro ao carregar empresas:", error);
    }
}


async function carregarEmpresasNoSelect() {
    const selectEmpresa = document.getElementById("empresa-id");
    if (!selectEmpresa) return;

    try {
        const querySnapshot = await getDocs(collection(db, "empresas"));
        selectEmpresa.innerHTML = '<option value="">Selecione a Empresa</option>';

        querySnapshot.forEach((doc) => {
            const empresa = doc.data();
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = empresa.nome;
            selectEmpresa.appendChild(option);
        });

        console.log("Empresas carregadas no select com sucesso.");
    } catch (error) {
        console.error("Erro ao carregar empresas no select:", error);
    }
}

async function excluirEmpresa(id) {
    try {
        await deleteDoc(doc(db, "empresas", id));
        console.log("Empresa excluída com sucesso! ID:", id);
        mostrarMensagemSucesso("Empresa excluída com sucesso!");
        carregarEmpresas();
    } catch (error) {
        console.error("Erro ao excluir empresa:", error);
    }
}

// ---------------------- TRABALHADORES ---------------------- //
async function adicionarTrabalhador(nome, cpf, cargo, empresaId, peatBasicoData, peatBasicoId, peatContinuadoData, peatContinuadoId) {
    try {
        const q = query(collection(db, "trabalhadores"), where("cpf", "==", cpf));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            mostrarMensagemErro("Já existe um trabalhador cadastrado com este CPF.");
            return;
        }

        const trabalhador = {
            nome,
            cpf,
            cargo,
            empresaId,
            peatBasicoData: peatBasicoData || "",
            peatBasicoId: peatBasicoId || "",
            peatContinuadoData: peatContinuadoData || "",
            peatContinuadoId: peatContinuadoId || ""
        };

        const docRef = await addDoc(collection(db, "trabalhadores"), trabalhador);
        console.log("Trabalhador cadastrado com sucesso! ID:", docRef.id);
        mostrarMensagemSucesso("Trabalhador cadastrado com sucesso!");
        carregarTrabalhadores();
    } catch (error) {
        console.error("Erro ao cadastrar trabalhador:", error);
        mostrarMensagemErro("Erro ao cadastrar trabalhador.");
    }
}

async function carregarTrabalhadores() {
    const tabelaContainer = document.getElementById("tabela-trabalhadores");
    if (!tabelaContainer) {
        console.error("Erro: Contêiner da tabela não encontrado.");
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "trabalhadores"));
        const tbody = tabelaContainer.querySelector("tbody");
        tbody.innerHTML = "";

        // Carregar todos os documentos de empresas para mapear IDs para nomes
        const empresasSnapshot = await getDocs(collection(db, "empresas"));
        const empresasMap = {};
        empresasSnapshot.forEach((doc) => {
            empresasMap[doc.id] = doc.data().nome; 
        });

        // Iterar sobre os trabalhadores
        querySnapshot.forEach((doc) => {
            const trabalhador = doc.data();
            const nomeEmpresa = empresasMap[trabalhador.empresaId] || "N/A";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${doc.id}</td>
                <td>${trabalhador.nome}</td>
                <td>${trabalhador.cpf}</td>
                <td>${trabalhador.cargo}</td>
                <td>${nomeEmpresa}</td>
                <td>${trabalhador.peatBasicoData || "N/A"}</td>
                <td>${trabalhador.peatBasicoId || "N/A"}</td>
                <td>${trabalhador.peatContinuadoData || "N/A"}</td>
                <td>${trabalhador.peatContinuadoId || "N/A"}</td>
                <td>
                    <button class="btn-excluir" data-id="${doc.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (querySnapshot.empty) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="10">Nenhum trabalhador encontrado.</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error("Erro ao carregar trabalhadores:", error);
    }
}


async function carregarTrabalhadoresPorEmpresa(empresaId) {
    const tabelaContainer = document.getElementById("tabela-trabalhadores");
    const nomeEmpresaElement = document.getElementById("nome-empresa");

    // Caso não exista esta tabela ou o ID da empresa, retorna
    if (!tabelaContainer || !empresaId) {
        return;
    }

    try {
        const empresaDoc = await getDoc(doc(db, "empresas", empresaId));
        if (empresaDoc.exists()) {
            nomeEmpresaElement.textContent = `Detalhes da Empresa: ${empresaDoc.data().nome}`;
        } else {
            nomeEmpresaElement.textContent = "Empresa não encontrada";
            return;
        }

        const q = query(collection(db, "trabalhadores"), where("empresaId", "==", empresaId));
        const querySnapshot = await getDocs(q);

        const tbody = tabelaContainer.querySelector("tbody");
        tbody.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const trabalhador = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${doc.id}</td>
                <td>${trabalhador.nome}</td>
                <td>${trabalhador.cpf}</td>
                <td>${trabalhador.cargo}</td>
                <td>${trabalhador.empresaId}</td>
                <td>${trabalhador.peatBasicoData || "N/A"}</td>
                <td>${trabalhador.peatBasicoId || "N/A"}</td>
                <td>${trabalhador.peatContinuadoData || "N/A"}</td>
                <td>${trabalhador.peatContinuadoId || "N/A"}</td>
                <td>
                    <button class="btn-excluir" data-id="${doc.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (querySnapshot.empty) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="10">Nenhum trabalhador encontrado para esta empresa.</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error("Erro ao carregar trabalhadores:", error);
    }
}

let trabalhadoresCache = [];

async function carregarTrabalhadoresParaPesquisa() {
    try {
        const querySnapshot = await getDocs(collection(db, "trabalhadores"));
        const empresasSnapshot = await getDocs(collection(db, "empresas"));

        // Mapear empresas
        const empresasMap = {};
        empresasSnapshot.forEach((doc) => {
            empresasMap[doc.id] = doc.data().nome;
        });

        // Armazenar trabalhadores no cache
        trabalhadoresCache = [];
        querySnapshot.forEach((doc) => {
            const trabalhador = { id: doc.id, ...doc.data() };
            trabalhador.nomeEmpresa = empresasMap[trabalhador.empresaId] || "N/A";
            trabalhadoresCache.push(trabalhador);
        });
    } catch (error) {
        console.error("Erro ao carregar trabalhadores:", error);
    }
}

function configurarFiltroPesquisa() {
    const inputPesquisa = document.getElementById("input-pesquisa");
    const tabelaContainer = document.getElementById("tabela-container");
    const tabelaResultado = document.getElementById("tabela-trabalhadores").querySelector("tbody");

    inputPesquisa.addEventListener("input", () => {
        const termo = inputPesquisa.value.toLowerCase();

        // Exibir ou ocultar a tabela com base no conteúdo da pesquisa
        if (termo.trim() === "") {
            tabelaContainer.style.display = "none"; // Oculta a tabela se o campo estiver vazio
            tabelaResultado.innerHTML = ""; // Limpa o conteúdo da tabela
            return;
        } else {
            tabelaContainer.style.display = "block"; // Exibe a tabela se há texto
        }

        // Filtrar trabalhadores pelo termo de pesquisa
        const trabalhadoresFiltrados = trabalhadoresCache.filter((trabalhador) => {
            return (
                trabalhador.nome.toLowerCase().includes(termo) ||
                trabalhador.id.toLowerCase().includes(termo)
            );
        });

        // Exibir resultados na tabela
        tabelaResultado.innerHTML = "";

        if (trabalhadoresFiltrados.length === 0) {
            tabelaResultado.innerHTML = `<tr><td colspan="7">Nenhum trabalhador encontrado.</td></tr>`;
        } else {
            trabalhadoresFiltrados.forEach((trabalhador) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${trabalhador.id}</td>
                    <td>${trabalhador.nome}</td>
                    <td>${trabalhador.cpf}</td>
                    <td>${trabalhador.cargo}</td>
                    <td>${trabalhador.nomeEmpresa}</td>
                    <td>${trabalhador.peatBasicoData || "N/A"}</td>
                    <td>${trabalhador.peatContinuadoData || "N/A"}</td>
                `;
                tabelaResultado.appendChild(tr);
            });
        }
    });
}


async function excluirTrabalhador(id) {
    try {
        await deleteDoc(doc(db, "trabalhadores", id));
        console.log("Trabalhador excluído com sucesso! ID:", id);
        mostrarMensagemSucesso("Trabalhador excluído com sucesso!");
        carregarTrabalhadores();
    } catch (error) {
        console.error("Erro ao excluir trabalhador:", error);
    }
}

// ---------------------- TREINAMENTOS ---------------------- //
async function adicionarTreinamento(tipo, validade, instrutor, participantes, observacoes) {
    try {
        const treinamento = { tipo, validade, instrutor, participantes, observacoes };
        await addDoc(collection(db, "treinamentos"), treinamento);
        mostrarMensagemSucesso("Treinamento cadastrado com sucesso!");
        document.getElementById("form-treinamento").reset();
    } catch (error) {
        console.error("Erro ao cadastrar treinamento:", error);
        mostrarMensagemErro("Erro ao cadastrar treinamento.");
    }
}

async function carregarTreinamentos() {
    try {
        const querySnapshot = await getDocs(collection(db, "treinamentos"));
        const basicos = [];
        const continuados = [];
        const outros = [];

        querySnapshot.forEach((doc) => {
            const treinamento = { id: doc.id, ...doc.data() };
            if (treinamento.tipo === "Básico") {
                basicos.push(treinamento);
            } else if (treinamento.tipo === "Continuado") {
                continuados.push(treinamento);
            } else if (treinamento.tipo === "Outro") {
                outros.push(treinamento);
            }
        });

        atualizarListaTreinamentos("Treinamentos Básicos", basicos, "basicos");
        atualizarListaTreinamentos("Treinamentos Continuados", continuados, "continuados");
        atualizarListaTreinamentos("Outros Treinamentos", outros, "outros");
    } catch (error) {
        console.error("Erro ao carregar treinamentos:", error);
    }
}

function atualizarListaTreinamentos(titulo, treinamentos, tipo) {
    const container = document.getElementById(`treinamentos-${tipo}`);
    if (!container) return;
    container.innerHTML = "";

    if (treinamentos.length === 0) {
        container.innerHTML = `<p>Não há treinamentos ${titulo.toLowerCase()} registrados.</p>`;
        return;
    }

    treinamentos.sort((a, b) => new Date(a.validade) - new Date(b.validade));

    treinamentos.forEach((treinamento) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h4>${treinamento.tipo}</h4>
            <p>Data: ${treinamento.validade}</p>
            <p>Instrutor: ${treinamento.instrutor}</p>
            ${treinamento.observacoes ? `<p>Observações: ${treinamento.observacoes}</p>` : ""}
            <button class="btn-excluir" data-id="${treinamento.id}">Excluir</button>
        `;
        card.addEventListener("click", () => exibirDetalhesTreinamento(treinamento));
        container.appendChild(card);

        const btnExcluir = card.querySelector(".btn-excluir");
        btnExcluir.addEventListener("click", (event) => {
            event.stopPropagation();
            excluirTreinamento(treinamento.id, container, tipo);
        });
    });
}

async function excluirTreinamento(id, container, tipo) {
    if (!confirm("Tem certeza de que deseja excluir este treinamento?")) {
        return;
    }
    try {
        await deleteDoc(doc(db, "treinamentos", id));
        mostrarMensagemSucesso("Treinamento excluído com sucesso!");
        carregarTreinamentos();
    } catch (error) {
        console.error("Erro ao excluir treinamento:", error);
        mostrarMensagemErro("Erro ao excluir treinamento.");
    }
}

function exibirDetalhesTreinamento(treinamento) {
    const modal = document.getElementById("modal-detalhes");
    const detalhesTreinamento = document.getElementById("detalhes-treinamento");

    if (!modal || !detalhesTreinamento) return;

    detalhesTreinamento.innerHTML = `
        <h4>Treinamento: ${treinamento.tipo}</h4>
        <p>Data: ${treinamento.validade}</p>
        <p>Instrutor: ${treinamento.instrutor}</p>
        ${treinamento.observacoes ? `<p>Observações: ${treinamento.observacoes}</p>` : ""}
    `;

    modal.style.display = "block";
    document.getElementById("fechar-modal")?.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

function configurarBotoesTreinamento() {
    const botoesTipo = document.querySelectorAll(".btn-tipo");
    const contenedoresTreinamento = {
        "Básico": document.getElementById("treinamentos-basicos"),
        "Continuado": document.getElementById("treinamentos-continuados"),
        "Outro": document.getElementById("treinamentos-outros"),
    };

    botoesTipo.forEach((botao) => {
        botao.addEventListener("click", async () => {
            const tipo = botao.getAttribute("data-tipo");

            Object.values(contenedoresTreinamento).forEach((container) => {
                container.style.display = "none";
                container.innerHTML = "";
            });

            if (contenedoresTreinamento[tipo]) {
                const container = contenedoresTreinamento[tipo];
                container.style.display = "block";

                const querySnapshot = await getDocs(collection(db, "treinamentos"));
                const treinamentos = [];

                querySnapshot.forEach((doc) => {
                    const treinamento = { id: doc.id, ...doc.data() };
                    if (treinamento.tipo === tipo) {
                        treinamentos.push(treinamento);
                    }
                });

                const treinamentosPorData = treinamentos.reduce((acc, treinamento) => {
                    if (!acc[treinamento.validade]) {
                        acc[treinamento.validade] = [];
                    }
                    acc[treinamento.validade].push(treinamento);
                    return acc;
                }, {});

                Object.keys(treinamentosPorData).forEach((data) => {
                    const dataButton = document.createElement("button");
                    dataButton.textContent = `Data: ${data}`;
                    dataButton.className = "btn-data";
                    dataButton.addEventListener("click", () =>
                        mostrarTreinamentosPorData(data, treinamentosPorData[data], container, tipo)
                    );
                    container.appendChild(dataButton);
                });
            } else {
                console.error(`Contêiner para o tipo "${tipo}" não encontrado.`);
            }
        });
    });
}

function mostrarTreinamentosPorData(data, treinamentos, container, tipo) {
    container.innerHTML = `<h3>Treinamentos em ${data}</h3>`;

    treinamentos.forEach((treinamento) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h4>${treinamento.tipo}</h4>
            <p>Data: ${treinamento.validade}</p>
            <p>Instrutor: ${treinamento.instrutor}</p>
            ${treinamento.observacoes ? `<p>Observações: ${treinamento.observacoes}</p>` : ""}
            <button class="btn-excluir" data-id="${treinamento.id}">Excluir</button>
        `;
        card.addEventListener("click", () => exibirDetalhesTreinamento(treinamento));
        container.appendChild(card);

        const btnExcluir = card.querySelector(".btn-excluir");
        btnExcluir.addEventListener("click", (event) => {
            event.stopPropagation();
            excluirTreinamento(treinamento.id, container, tipo);
        });
    });

    const voltarButton = document.createElement("button");
    voltarButton.textContent = "Voltar às Datas";
    voltarButton.className = "btn-voltar";
    voltarButton.addEventListener("click", async () => {
        const querySnapshot = await getDocs(collection(db, "treinamentos"));
        const treinamentosDoTipo = [];

        querySnapshot.forEach((doc) => {
            const treinamento = { id: doc.id, ...doc.data() };
            if (treinamento.tipo === tipo) {
                treinamentosDoTipo.push(treinamento);
            }
        });

        const treinamentosPorData = treinamentosDoTipo.reduce((acc, treinamento) => {
            if (!acc[treinamento.validade]) {
                acc[treinamento.validade] = [];
            }
            acc[treinamento.validade].push(treinamento);
            return acc;
        }, {});

        container.innerHTML = `<h3>Treinamentos ${tipo}</h3>`;
        Object.keys(treinamentosPorData).forEach((data) => {
            const dataButton = document.createElement("button");
            dataButton.textContent = `Data: ${data}`;
            dataButton.className = "btn-data";
            dataButton.addEventListener("click", () =>
                mostrarTreinamentosPorData(data, treinamentosPorData[data], container, tipo)
            );
            container.appendChild(dataButton);
        });
    });
    container.appendChild(voltarButton);
}

// ---------------------- EVENTOS DE FORMULÁRIO ---------------------- //
const formTrabalhador = document.getElementById("form-trabalhador");
if (formTrabalhador) {
    formTrabalhador.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value;
        const cargo = document.getElementById("cargo").value;
        const empresaId = document.getElementById("empresa-id").value;

        const peatBasicoData = document.getElementById("peat-basico-data")?.value || "";
        const peatBasicoId = document.getElementById("peat-basico-link")?.value || "";
        const peatContinuadoData = document.getElementById("peat-continuado-data")?.value || "";
        const peatContinuadoId = document.getElementById("peat-continuado-link")?.value || "";

        await adicionarTrabalhador(nome, cpf, cargo, empresaId, peatBasicoData, peatBasicoId, peatContinuadoData, peatContinuadoId);
        formTrabalhador.reset();
    });
}

const inputCPF = document.getElementById("cpf");
if (inputCPF) {
    inputCPF.addEventListener("input", () => {
        const valor = inputCPF.value.replace(/\D/g, "");
        inputCPF.value = valor.slice(0, 11);
    });
}

const inputNome = document.getElementById("nome");
if (inputNome) {
    inputNome.addEventListener("input", () => {
        const valor = inputNome.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        inputNome.value = valor;
    });
}

const inputCargo = document.getElementById("cargo");
if (inputCargo) {
    inputCargo.addEventListener("input", () => {
        const valor = inputCargo.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        inputCargo.value = valor;
    });
}

const formEmpresa = document.getElementById("form-empresa");
if (formEmpresa) {
    formEmpresa.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nomeEmpresa = document.getElementById("nome-empresa").value;
        await adicionarEmpresa(nomeEmpresa);
        formEmpresa.reset();
    });
}

const formTreinamento = document.getElementById("form-treinamento");
if (formTreinamento) {
    formTreinamento.addEventListener("submit", async (event) => {
        event.preventDefault();
        const tipo = document.getElementById("tipo-treinamento").value;
        const validade = document.getElementById("validade-treinamento").value;
        const instrutor = document.getElementById("instrutor").value;
        const observacoes = document.getElementById("observacoes-treinamento").value;

        const participantes = []; // Ajustar se necessário

        await adicionarTreinamento(tipo, validade, instrutor, participantes, observacoes);
    });
}

// ---------------------- INICIALIZAÇÃO ---------------------- //
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = urlParams.get("id");
    
    // Caso tenha empresaId na URL, carrega somente os trabalhadores dessa empresa
    if (empresaId) {
        carregarTrabalhadoresPorEmpresa(empresaId);
    } else {
        // Caso não tenha empresaId, carrega todas as empresas e todos os trabalhadores
        carregarEmpresas();
        carregarTrabalhadores();
    }

    carregarEmpresasNoSelect();
    carregarTreinamentos();
    configurarBotoesTreinamento();
    carregarTrabalhadoresParaPesquisa();
    configurarFiltroPesquisa();
    

    const peatBasicoDataInput = document.getElementById("peat-basico-data");
    const peatBasicoSelect = document.getElementById("peat-basico-link");
    const peatContinuadoDataInput = document.getElementById("peat-continuado-data");
    const peatContinuadoSelect = document.getElementById("peat-continuado-link");

    function filtrarTreinamentosPorData(dataSelecionada, treinamentos) {
        return treinamentos.filter(t => t.validade === dataSelecionada);
    }

    if (peatBasicoDataInput && peatBasicoSelect) {
        peatBasicoDataInput.addEventListener("change", () => {
            const dataSelecionada = peatBasicoDataInput.value;
            const filtrados = filtrarTreinamentosPorData(dataSelecionada, basicos);
            peatBasicoSelect.innerHTML = '<option value="">Selecione o Treinamento Básico</option>';
            filtrados.forEach(t => {
                const option = document.createElement("option");
                option.value = t.id;
                option.textContent = `${t.instrutor} - ${t.validade}`;
                peatBasicoSelect.appendChild(option);
            });
        });
    }

    if (peatContinuadoDataInput && peatContinuadoSelect) {
        peatContinuadoDataInput.addEventListener("change", () => {
            const dataSelecionada = peatContinuadoDataInput.value;
            const filtrados = filtrarTreinamentosPorData(dataSelecionada, continuados);
            peatContinuadoSelect.innerHTML = '<option value="">Selecione o Treinamento Continuado</option>';
            filtrados.forEach(t => {
                const option = document.createElement("option");
                option.value = t.id;
                option.textContent = `${t.instrutor} - ${t.validade}`;
                peatContinuadoSelect.appendChild(option);
            });
        });
    }
});




