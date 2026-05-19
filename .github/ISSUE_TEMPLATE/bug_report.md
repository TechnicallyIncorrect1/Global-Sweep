name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: [bug]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug! Fill out as much as possible below.
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Please describe the bug in detail.
    validations:
      required: true
  - type: textarea
    id: steps-to-reproduce
    attributes:
      label: Steps To Reproduce
      description: How can we reproduce the issue?
    validations:
      required: true
  - type: textarea
    id: expected-behavior
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: OS, version, special dependencies
