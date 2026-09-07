import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Io

FloatingWindow {
    id: root
    title: "Silo: Levels"
    implicitWidth: 1040
    implicitHeight: 700
    color: "#111814"
    property var levels: JSON.parse(Quickshell.env("SILO_LEVELS"))
    property int selected: Number(Quickshell.env("SILO_LEVEL_INDEX"))
    property int pending: selected
    property string message: "Choose a stop to change your wallpaper"
    property bool busy: transition.running || setter.running
    function travel(index) {
        if (busy || index < 0 || index >= levels.length) return;
        pending = index;
        transition.start();
    }
    IpcHandler {
        target: "levels"
        function next(): void { root.travel(root.selected + 1); }
        function previous(): void { root.travel(root.selected - 1); }
        function status(): string { return JSON.stringify({index: root.selected, busy: root.busy, message: root.message}); }
        function quit(): void { Qt.quit(); }
    }
    Process {
        id: setter
        command: ["omarchy", "theme", "bg", "set", root.levels[root.selected].path]
        onExited: (code, status) => {
            root.message = code === 0 ? "Wallpaper set · " + root.levels[root.selected].name : "Could not set wallpaper. Check that Omarchy is running.";
        }
    }
    SequentialAnimation {
        id: transition
        NumberAnimation { target: scene; property: "opacity"; to: 0; duration: 220 }
        ScriptAction { script: { root.selected = root.pending; root.message = "Travelling to " + root.levels[root.selected].name; setter.running = true; } }
        PauseAnimation { duration: 180 }
        NumberAnimation { target: scene; property: "opacity"; to: 1; duration: 420 }
    }
    component LevelButton: Button {
        contentItem: Text {
            text: parent.text
            color: parent.enabled ? "#ddd3b7" : "#6c7566"
            font.pixelSize: 14
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }
        background: Rectangle {
            implicitWidth: 150; implicitHeight: 40
            color: parent.down ? "#514b36" : parent.hovered ? "#343c2e" : "#222b22"
            border.color: parent.enabled ? "#756b4d" : "#343c2e"
            radius: 3
        }
    }
    Rectangle {
        id: surface
        anchors.fill: parent
        color: root.color
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 28
        spacing: 16
        RowLayout {
            Layout.fillWidth: true
            ColumnLayout {
                Text { text: "S I L O  /  L E V E L S"; color: "#c6b68b"; font.pixelSize: 22 }
                Text { text: "A journey from the upper levels to the world outside"; color: "#8d998b"; font.pixelSize: 13 }
            }
            Item { Layout.fillWidth: true }
            LevelButton { text: "Exit"; onClicked: Qt.quit() }
        }
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#080c09"
            border.color: "#756b4d"
            clip: true
            Image {
                id: scene
                anchors.fill: parent
                anchors.margins: 1
                source: root.levels[root.selected].url
                fillMode: Image.PreserveAspectCrop
                asynchronous: true
            }
            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 100
                gradient: Gradient { GradientStop { position: 0; color: "#00111814" } GradientStop { position: 1; color: "#ee111814" } }
            }
            Column {
                anchors.left: parent.left; anchors.bottom: parent.bottom; anchors.margins: 22
                spacing: 5
                Text { text: root.levels[root.selected].name; color: "#e4ddc8"; font.pixelSize: 28 }
                Text { text: root.levels[root.selected].caption; color: "#c0b699"; font.pixelSize: 13 }
            }
        }
        RowLayout {
            Layout.fillWidth: true
            LevelButton { text: "↑ Previous level"; enabled: !root.busy && root.selected > 0; onClicked: root.travel(root.selected - 1) }
            ComboBox {
                Layout.fillWidth: true
                model: root.levels
                textRole: "name"
                currentIndex: root.selected
                enabled: !root.busy
                onActivated: index => root.travel(index)
            }
            LevelButton { text: "Next level ↓"; enabled: !root.busy && root.selected < root.levels.length - 1; onClicked: root.travel(root.selected + 1) }
        }
        Text { text: root.message; color: "#a5af9d"; font.pixelSize: 12; Layout.fillWidth: true; wrapMode: Text.Wrap }
    }
    }
    Shortcut { sequence: "Escape"; onActivated: Qt.quit() }
    Shortcut { sequence: "Right"; onActivated: root.travel(root.selected + 1) }
    Shortcut { sequence: "Left"; onActivated: root.travel(root.selected - 1) }
}
