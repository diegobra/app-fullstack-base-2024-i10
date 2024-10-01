class Main implements EventListenerObject {

    private devices: Array<Device> = []; // Almacena los dispositivos cargados

    constructor() {

        let btnRefresh = this.retrieveElement("btnRefresh");
        btnRefresh.addEventListener('click', this);
        let btnAddDevice = this.retrieveElement("btnAddDevice");
        btnAddDevice.addEventListener('click', this);
        let btnSave = this.retrieveElement("saveDevice");
        btnSave.addEventListener('click', this);
        let btnCancelChanges = this.retrieveElement("cancelDeviceChanges");
        btnCancelChanges.addEventListener('click', this);

        this.refreshDevices();

    }
    handleEvent(object: Event): void {
        let elementId = (<HTMLElement>object.target).id;
        let elementName = (<HTMLInputElement>object.target).name;

        if (elementId === 'btnRefresh') {
            this.refreshDevices();
        } else if (elementId === 'saveDevice') {
            this.saveDevice();
        } else if (elementId === 'cancelDeviceChanges') {
            this.hideDeviceEditPanel();
        } else if (elementId === 'btnAddDevice') {
            // Se abre el panel de ABM en modo alta (se le pasa índice -1)
            this.showDeviceEditPanel(-1);

            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    console.log("se ejecuto el post", xmlHttp.responseText);
                }
            }

            xmlHttp.open("POST", "http://localhost:8000/usuario", true);

            xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.setRequestHeader("otracosa", "algo");


            let json = { name: 'mramos' };
            xmlHttp.send(JSON.stringify(json));

        } else if (elementName === "edit-device-state") {
            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute("device-id-bd");
            let deviceValue = deviceElem.value;

            console.log(deviceId);
            console.log(deviceValue);

        } else if (elementId.startsWith('editDevicfdseState_')) {
            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute("device-id-bd");
            let deviceValue = deviceElem.value;

            console.log(deviceId);
            console.log(deviceValue);
        }

    }

    private refreshDevices(): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                let ul = this.retrieveElement("list");
                let devicesList: string = '';

                this.devices = JSON.parse(xmlHttp.responseText); // Guardamos los dispositivos

                for (let index in this.devices) {
                    let item = this.devices[index];
                    devicesList += `<div class="col s12 m6 l3 xl3">
                                    <div class="card blue darken-2 white-text">
                                    <div class="card-content">
                                        <span class="card-title">
                                            <i class="material-icons left">ac_unit</i> 
                                            ${item.name}
                                        </span>
                                        <p>${item.description}</p>
                                        <p>
                                            <input id="editDeviceState_${index}" device-id-bd="${item.id}" name="edit-device-state" data-index="${index}" type="range" min="0" max="1" step="0.1" value="${item.state}" id="deviceState">
                                        </p>
                                    </div>
                                    <div class="card-action">
                                        <a href="#" name='edit-device' class="white-text" data-index="${index}">EDITAR</a>
                                        <a href="#" name='delete-device' class="white-text" data-index="${index}">ELIMINAR</a>
                                    </div>
                                    </div></div>`;

                }
                ul.innerHTML = devicesList;

                // Se agregan eventos para los botones de editar
                let editButtons = document.getElementsByName('edit-device');
                editButtons.forEach(button => {
                    button.addEventListener('click', this);
                    /*button.addEventListener('click', (event: Event) => {
                        let index = (<HTMLElement>event.target).getAttribute('data-index');
                        this.showDeviceEditPanel(parseInt(index));
                    });*/
                });

                // Se agregan eventos para los editores de estado
                let stateEditButtons = document.getElementsByName('edit-device-state');
                stateEditButtons.forEach(button => {
                    button.addEventListener('click', this);
                    /*button.addEventListener('click', (event: Event) => {
                        let index = (<HTMLElement>event.target).getAttribute('data-index');
                        this.editDeviceState(parseInt(index));
                    });*/
                });

                // Se agregan eventos para los botones de editar
                let deleteButtons = document.getElementsByName('delete-device');
                deleteButtons.forEach(button => {
                    button.addEventListener('input', (event: Event) => {
                        let index = (<HTMLElement>event.target).getAttribute('data-index');

                        if (confirm('¿Confirma eliminar el dispositivo?')) {
                            this.deleteDevice(parseInt(index));
                        }

                    });
                });
            } else if (xmlHttp.readyState == 4) {
                alert("ERROR en la consulta");
            }
        }

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();
    }

    private showDeviceEditPanel(index: number): void {

        if (index >= 0) {
            let dispositivo = this.devices[index];

            this.retrieveElement("deviceEditorTitle").innerText = "Editar dispositvo";

            // Rellenar los campos del panel con los datos del dispositivo
            this.retrieveElement("editName").value = dispositivo.name;
            this.retrieveElement("editDescription").value = dispositivo.description;
            this.retrieveElement("editType").value = dispositivo.type.toString();

            this.retrieveElement("editNameLabel").setAttribute("class", "active");
            this.retrieveElement("editDescriptionLabel").setAttribute("class", "active");

        } else { // No se recibe dispositivo, es un alta

            this.retrieveElement("deviceEditorTitle").innerText = "Agregar dispositvo";

            this.retrieveElement("editNameLabel").setAttribute("class", "");
            this.retrieveElement("editDescriptionLabel").setAttribute("class", "");
        }
        // Mostrar el panel de edición
        let panel = document.getElementById("editPanel");
        if (panel) {
            panel.style.display = "block";
        }

        this.hideActionPanel();

    }

    private deleteDevice(index: number): void {
        console.log('Se elimina device ' + index);

        this.refreshDevices();
    }

    private hideDeviceEditPanel(): void {
        this.retrieveElement("editName").value = "";
        this.retrieveElement("editDescription").value = "";
        this.retrieveElement("editType").value = "";

        let panel = document.getElementById("editPanel");
        if (panel) {
            panel.style.display = "none";
        }

        this.showActionPanel();
    }

    private hideActionPanel(): void {
        this.retrieveElement("actionPanel").style.display = "none"
    }

    private showActionPanel(): void {
        this.retrieveElement("actionPanel").style.display = "block"
    }

    private saveDevice(): void {
        let deviceName = this.retrieveElement("editName").value;
        let deviceDescription = this.retrieveElement("editDescription").value;
        let deviceType = this.retrieveElement("editType").value;

        if (!deviceName || !deviceDescription || !deviceType || deviceType === '0')
            alert('No se han ingresado todos los datos.')
        else {

            // Aquí puedes implementar la lógica para guardar los cambios (por ejemplo, hacer un PUT/POST)
            console.log(`Guardando cambios: ${deviceName}, ${deviceDescription}, ${deviceType}`);

            this.hideDeviceEditPanel();

            this.refreshDevices();

        }
    }

    private editDeviceState(index: number): void {
        let stateValue: number = parseFloat(this.retrieveElement(`edit-device-state${index}`).value)
        console.log('edita el estado del dispotivo ' + index + ' con el valor ' + stateValue);
        this.refreshDevices();
    }


    private retrieveElement(id: string): HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}
window.addEventListener('load', () => {

    let main: Main = new Main();

});



// Materialize

// Se agrega esta declaración para que TS no devuelva error.
declare const M: any;

// JS para que funcione el elemento select de Materialize
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});
