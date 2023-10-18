using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using WindowsInput.Native;
using WindowsInput;
using System.Net.Configuration;
using System.Threading;

namespace EventEmitter
{
    class Program
    {
        [DllImport("user32.dll", SetLastError = true)]        
        static extern bool SetForegroundWindow(IntPtr hWnd);

        static void Main(string[] args)
        {
            int pid = Convert.ToInt32(args[0]);
            int msg = (int)new System.ComponentModel.Int32Converter().ConvertFromString(args[1]);
            int key = (int)new System.ComponentModel.Int32Converter().ConvertFromString(args[2]);            

            Process proc = Process.GetProcessById(pid);
            IntPtr window = proc.MainWindowHandle;

            SetForegroundWindow(window);

            InputSimulator sim = new InputSimulator();
            switch (msg)
            {
                case 0x100: // normal key down
                    sim.Keyboard.KeyDown((VirtualKeyCode)key);
                    break;
                case 0x101: // normal key up
                    sim.Keyboard.KeyUp((VirtualKeyCode)key);
                    break;
                case 0x102: // normal key press
                    sim.Keyboard.KeyPress((VirtualKeyCode)key);
                    break;
                case 0x103: // control key press
                    sim.Keyboard.ModifiedKeyStroke(VirtualKeyCode.CONTROL, (VirtualKeyCode)key);
                    break;
                case 0x104: // shift key press
                    sim.Keyboard.ModifiedKeyStroke(VirtualKeyCode.SHIFT, (VirtualKeyCode)key);
                    break;
                case 0x105: // alt key press
                    sim.Keyboard.ModifiedKeyStroke(VirtualKeyCode.MENU, (VirtualKeyCode)key);
                    break;
            }
        }
    }
}
