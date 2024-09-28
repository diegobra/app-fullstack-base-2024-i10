class Main implements EventListenerObject {

    private dispositivos: Array<Device> = []; // Almacena los dispositivos cargados

    constructor() {
        
        let btnBuscar = this.recuperarElemento("btnBuscar");
        btnBuscar.addEventListener('click', this);
        let btnAddDevice = this.recuperarElemento("btnAddDevice");
        btnAddDevice.addEventListener('click', this);
        let btnSave = this.recuperarElemento("saveDevice");
        btnSave.addEventListener('click', this);
    }
    handleEvent(object: Event): void {
        let idDelElemento = (<HTMLElement>object.target).id;
        if (idDelElemento === 'btnBuscar') {
            this.buscarDevices();
        } else if (idDelElemento === 'saveDevice') {
            this.guardarCambios();
        } else if (idDelElemento === 'btnAddDevice') {
            // Se abre el panel de ABM en modo alta (se le pasa índice -1)
            this.mostrarPanelABM(-1);

            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    console.log("se ejecuto el post", xmlHttp.responseText);
                }
            }
           
            xmlHttp.open("POST", "http://localhost:8000/usuario", true);
            
            xmlHttp.setRequestHeader("Content-Type", "application/json"); 
            xmlHttp.setRequestHeader("otracosa", "algo"); 
            

            let json = {name: 'mramos' };
            xmlHttp.send(JSON.stringify(json));
        }
        
    }

    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();
        
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                let ul = this.recuperarElemento("list");
                let listaDevices: string = '';
                
                this.dispositivos = JSON.parse(xmlHttp.responseText); // Guardamos los dispositivos

                for (let index in this.dispositivos) {
                    let item = this.dispositivos[index];
                    listaDevices += `
                    <li class="collection-item avatar">
                        <img src="./static/images/lightbulb.png" alt="" class="circle">
                        <span class="title">${item.name}</span>
                        <p>${item.description}</p>
                        <a href="#!" class="secondary-content">
                          <div class="switch">
                              <label>
                                Off`;
                    if (item.state) {
                        listaDevices += '<input type="checkbox" checked>';
                    } else {
                        listaDevices += '<input type="checkbox">';
                    }
                    listaDevices += `      
                                <span class="lever"></span>
                                On
                              </label>
                            </div>
                          <i class="material-icons edit-device" data-index="${index}">edit</i> 
                      </a>
                    </li>`;
                }
                ul.innerHTML = listaDevices;

                // Agregar eventos para los botones de editar
                let editButtons = document.querySelectorAll('.edit-device');
                editButtons.forEach(button => {
                    button.addEventListener('click', (event: Event) => {
                        let index = (<HTMLElement>event.target).getAttribute('data-index');
                        this.mostrarPanelABM(parseInt(index));
                    });
                });
            } else if (xmlHttp.readyState == 4) {
                alert("ERROR en la consulta");
            }
        }

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();
    }

    private mostrarPanelABM(index: number): void {

        if (index >= 0) {
            let dispositivo = this.dispositivos[index];

            this.recuperarElemento("deviceEditorTitle").innerText = "Editar dispositvo";

            // Rellenar los campos del panel con los datos del dispositivo
            this.recuperarElemento("editName").value = dispositivo.name;
            this.recuperarElemento("editDescription").value = dispositivo.description;
            this.recuperarElemento("editType").value = dispositivo.type.toString();
            this.recuperarElemento("editState").value = dispositivo.state.toString();

            this.recuperarElemento("editNameLabel").setAttribute("class", "active");
            this.recuperarElemento("editDescriptionLabel").setAttribute("class", "active");
            this.recuperarElemento("editTypeLabel").setAttribute("class", "active");
            this.recuperarElemento("editStateLabel").setAttribute("class", "active");

        } else { // No se recibe dispositivo, es un alta

            this.recuperarElemento("deviceEditorTitle").innerText = "Agregar dispositvo";

            this.recuperarElemento("editNameLabel").setAttribute("class", "");
            this.recuperarElemento("editDescriptionLabel").setAttribute("class", "");
            this.recuperarElemento("editTypeLabel").setAttribute("class", "");
            this.recuperarElemento("editStateLabel").setAttribute("class", "");
        }
        // Mostrar el panel de edición
        let panel = document.getElementById("editPanel");
        if (panel) {
            panel.style.display = "block";
        }
    }

    private ocultarPanelEdicion(): void {
        this.recuperarElemento("editName").value = "";
        this.recuperarElemento("editDescription").value = "";
        this.recuperarElemento("editType").value = "";
        this.recuperarElemento("editState").value = "";

        let panel = document.getElementById("editPanel");
        if (panel) {
            panel.style.display = "none";
        }
    }

    private guardarCambios(): void {
        let name = this.recuperarElemento("editName").value;
        let description = this.recuperarElemento("editDescription").value;
        let type = this.recuperarElemento("editType").value;
        let state = parseFloat(this.recuperarElemento("editState").value);

        // Aquí puedes implementar la lógica para guardar los cambios (por ejemplo, hacer un PUT/POST)
        console.log(`Guardando cambios: ${name}, ${description}, ${type}, ${state}`);

        this.ocultarPanelEdicion();

        this.buscarDevices();
    }
    
    

    private recuperarElemento(id: string):HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}
window.addEventListener('load', () => {
    
    let main: Main = new Main();
    
});