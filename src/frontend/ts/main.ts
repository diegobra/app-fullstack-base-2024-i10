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
            this.showDeviceEditPanel(-1);

            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    console.log("POST ejecutado", xmlHttp.responseText);
                }
            };
            xmlHttp.open("POST", "http://localhost:8000/usuario", true);
            xmlHttp.setRequestHeader("Content-Type", "application/json");
            let json = { name: 'mramos' };
            xmlHttp.send(JSON.stringify(json));
        } 
        // Para cambiar el estado de un dispositivo
        else if (elementName === "edit-device-state") {
            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute("device-id-bd");
            let deviceValue = deviceElem.value;

            console.log(`Cambiando estado del dispositivo ${deviceId} a ${deviceValue}`);
            this.updateDeviceState(parseInt(deviceId!), parseFloat(deviceValue));
        } else if (elementName === 'edit-device') {
            let deviceElem = <HTMLInputElement>object.target;
            let index = deviceElem.getAttribute('data-index');
            this.showDeviceEditPanel(parseInt(index!));
        } else if (elementName === 'delete-device') {
            let deviceElem = <HTMLInputElement>object.target;
            let index = deviceElem.getAttribute('data-index');
			if (confirm('¿Confirma eliminar el dispositivo?')) {
				this.deleteDevice(parseInt(index!));
			}
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
                                            <input id="editDeviceState_${index}" 
                                                   device-id-bd="${item.id}" 
                                                   name="edit-device-state" 
                                                   data-index="${index}" 
                                                   type="range" 
                                                   min="0" 
                                                   max="1" 
                                                   step="0.1" 
                                                   value="${item.state}">
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
                });

                // Se agregan eventos para los editores de estado
                let stateEditButtons = document.getElementsByName('edit-device-state');
                stateEditButtons.forEach(button => {
                    button.addEventListener('change', this); // Escucha cambios en el slider
                });

                // Se agregan eventos para los botones de eliminar
                let deleteButtons = document.getElementsByName('delete-device');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', this);
                });
            } else if (xmlHttp.readyState == 4) {
                alert("ERROR en la consulta");
            }
        };

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();
    }

    // Método para actualizar el estado del dispositivo
    private updateDeviceState(deviceId: number, newState: number): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log(`Estado del dispositivo ${deviceId} actualizado a ${newState}`);
                this.refreshDevices(); // Refresca los dispositivos después de la actualización
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al actualizar el estado del dispositivo ${deviceId}`);
            }
        };

        xmlHttp.open("PATCH", `http://localhost:8000/device/${deviceId}/state`, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(JSON.stringify({ state: newState }));
    }

    private showDeviceEditPanel(index: number): void {
        if (index >= 0) {
            let dispositivo = this.devices[index];

            this.retrieveElement("deviceEditorTitle").innerText = "Editar dispositivo";
            this.retrieveElement("editName").value = dispositivo.name;
            this.retrieveElement("editDescription").value = dispositivo.description;
            this.retrieveElement("editTypeId").value = dispositivo.typeId.toString();
            this.retrieveElement("editNameLabel").classList.add("active");
            this.retrieveElement("editDescriptionLabel").classList.add("active");

        } else {
            this.retrieveElement("deviceEditorTitle").innerText = "Agregar dispositivo";
            this.retrieveElement("editName").value = "";
            this.retrieveElement("editDescription").value = "";
            this.retrieveElement("editTypeId").value = "0";
            this.retrieveElement("editNameLabel").classList.remove("active");
            this.retrieveElement("editDescriptionLabel").classList.remove("active");
        }
		  
        let panel = document.getElementById("editPanel");
        if (panel) panel.style.display = "block";

        this.hideActionPanel();
    }

    private deleteDevice(index: number): void {
        let deviceId = this.devices[index].id; // Obtener el ID del dispositivo a eliminar
    
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log(`Dispositivo ${deviceId} eliminado exitosamente.`);
                this.refreshDevices(); // Refresca los dispositivos después de eliminar
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al eliminar el dispositivo ${deviceId}`);
            }
        };
    
        xmlHttp.open("DELETE", `http://localhost:8000/device/${deviceId}`, true);
        xmlHttp.send();
    }

    private hideDeviceEditPanel(): void {
        this.retrieveElement("editName").value = "";
        this.retrieveElement("editDescription").value = "";
        this.retrieveElement("editTypeId").value = "0";

        let panel = document.getElementById("editPanel");
        if (panel) panel.style.display = "none";

        this.showActionPanel();
    }

    private hideActionPanel(): void {
        this.retrieveElement("actionPanel").style.display = "none";
    }

    private showActionPanel(): void {
        this.retrieveElement("actionPanel").style.display = "block";
    }

    private saveDevice(): void {
        let deviceName = this.retrieveElement("editName").value;
        let deviceDescription = this.retrieveElement("editDescription").value;
        let deviceTypeId = this.retrieveElement("editTypeId").value;
    
        if (!deviceName || !deviceDescription || deviceTypeId === '0') {
            alert('No se han ingresado todos los datos.');
            return;
        }
    
        let isEditing = this.retrieveElement("deviceEditorTitle").innerText === "Editar dispositivo";
        let deviceId = isEditing ? this.devices[this.retrieveElement("editName").getAttribute("data-index")].id : null;
    
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            console.log('xmlHttp.readyState = ' + xmlHttp.readyState);
            console.log('xmlHttp.status = ' + xmlHttp.status);
            if (xmlHttp.readyState == 4 && xmlHttp.status.toString().startsWith('2')) {
                console.log('entro1');
                console.log(`Dispositivo ${deviceName} guardado exitosamente.`);
                this.hideDeviceEditPanel();
                this.refreshDevices(); // Refresca los dispositivos después de guardar
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al guardar el dispositivo ${deviceName}`);
            }
        };
    
        let method = isEditing ? "PUT" : "POST";
        let url = isEditing ? `http://localhost:8000/device/${deviceId}` : "http://localhost:8000/device";
    
        xmlHttp.open(method, url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
    
        let deviceData = {
            name: deviceName,
            description: deviceDescription,
            typeId: parseInt(deviceTypeId)
        };
    
        xmlHttp.send(JSON.stringify(deviceData));
    }
    
    private retrieveElement(id: string): HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}

window.addEventListener('load', () => {
    let main: Main = new Main();
});

// Materialize JS para que funcione el select

// Se agrega esta declaración para que TS no devuelva error.
declare const M: any;

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});
