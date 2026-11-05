"""僅在127.0.0.1提供獨立美術驗收網站，支援影片Range請求。"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse, re

ROOT=Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)

    def send_head(self):
        self.byte_range=None
        path=Path(self.translate_path(self.path))
        header=self.headers.get('Range')
        if header and path.is_file():
            size=path.stat().st_size
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',header)
            if match:
                a,b=match.groups()
                start=int(a) if a else max(0,size-int(b or size))
                end=min(int(b),size-1) if b and a else size-1
                if start>=size or end<start:
                    self.send_error(416);return None
                f=path.open('rb');f.seek(start);self.byte_range=end-start+1
                self.send_response(206);self.send_header('Content-type',self.guess_type(str(path)))
                self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length',str(self.byte_range));self.end_headers();return f
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        super().end_headers()

    def copyfile(self,source,outputfile):
        remaining=self.byte_range
        if remaining is None:
            return super().copyfile(source,outputfile)
        while remaining:
            chunk=source.read(min(65536,remaining))
            if not chunk:break
            outputfile.write(chunk);remaining-=len(chunk)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=5174);args=parser.parse_args()
    if not (ROOT/'assets/art-redesign-v4/review.html').exists():raise SystemExit('美術驗收素材尚未完成，請先執行prepare_art_review.py。')
    print(f'新版美術驗收：http://127.0.0.1:{args.port}/assets/art-redesign-v4/review.html',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
