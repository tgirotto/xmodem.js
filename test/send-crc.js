describe('XMODEM Send - crc', function() {
  var xmodem = require('../lib/index');
  const net = require('net');
  const server = net.createServer();
  
  it('rz should connect and start receiving', function(done) {
    this.timeout(60000);
    
    if(tcpsocket_enable) {
      server.listen(tcpsocket_port, tcpsocket_addr);
    }
    else {
      server.listen(unixsocket);  
    }
    
    server.once('connection', function(socket) {
      var buffer = fs.readFileSync(sendFile);
      xmodem.send(socket, buffer);
    });
    
    const execFile = require('child_process').execFile;
  
    const child = execFile('rz', ['-X', '-c', '-a', '--tcp-client', tcpsocket_addr + ':' + tcpsocket_port, receiveFile], (error, stdout, stderr) => {
      if (error) {
        console.error('stderr', stderr);
        throw error;
      }
      assert.equal('connecting to [' + tcpsocket_addr + '] <' + tcpsocket_port + '>\n\n', stdout);
    });
    
    child.once('close', function(code) {
      assert.equal(0, code);
      done();
    });
  });
  
  it('receive file should exist', function(done) {
    setTimeout(function() {
      assert.equal(true, fs.existsSync(receiveFile));
      done();
    }, 100);
  });
  
  it('send and receive files should be identical', function(done) {
    const md5File = require('md5-file');
    assert.equal(md5File.sync(sendFile), md5File.sync(receiveFile));
    done();
  });
  
  it('receiveFile rm should return undefined', function(done) {
    assert.equal(undefined, fs.unlinkSync(receiveFile));
    done();
  });
  
  it('socket should have 0 connections', function(done) {
    assert.equal(0, server._connections);
    done();
  });
  
  it('server should close', function(done) {
    server.once('close', function() {
      done();
    });
      
    server.close();
    delete require.cache[require.resolve('net')];
  });
  
  delete require.cache[require.resolve('../lib/index.js')];
});