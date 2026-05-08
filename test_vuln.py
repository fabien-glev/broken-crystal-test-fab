"""Synthetic vuln to exercise Glev Continuous on this PR."""
import subprocess
from flask import Flask, request

app = Flask(__name__)


@app.route("/run")
def run():
    cmd = request.args.get("cmd", "echo hi")
    return subprocess.check_output(cmd, shell=True)
