import importlib.util
from pathlib import Path
from threading import Thread
import unittest
from http.client import HTTPConnection
spec=importlib.util.spec_from_file_location('server',Path(__file__).resolve().parents[1]/'companion/serve.py')
server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)
class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
        cls.thread=Thread(target=cls.httpd.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown();cls.httpd.server_close();cls.thread.join()
    def request(self,path,headers={}):
        conn=HTTPConnection('127.0.0.1',self.httpd.server_port);conn.request('GET',path,headers=headers);r=conn.getresponse();result=(r.status,dict(r.getheaders()),r.read());conn.close();return result
    def test_public_assets_and_csp(self):
        status,headers,body=self.request('/');self.assertEqual(status,200);self.assertIn(b'Mechanical duty',body);self.assertIn("connect-src 'none'",headers['Content-Security-Policy'])
    def test_no_private_files_or_traversal(self):
        for path in ['/serve.py','/../README.md','/%2e%2e/README.md','/.git/config']:
            self.assertEqual(self.request(path)[0],404)
    def test_foreign_host_rejected(self):
        self.assertEqual(self.request('/',{'Host':'attacker.example'})[0],403)
    def test_health(self):
        self.assertEqual(self.request('/health')[2],b'silo-mechanical-v1')
if __name__=='__main__':unittest.main()
