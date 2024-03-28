# Contributing to Kiroku

Greetings, and thank you for your interest in contributing to the Kiroku open source repository. Your contribution, no matter how large or small it may be, is always highly welcome and appreciated.

## Getting started

Before you can jump into writing code, there are several mandatory things you must do. First, we kindly ask you to read this readme file in its entirety. Once you have done that, go ahead and review our coding practices in [this README file][main README]. If you are not acquainted with the technology stack we employ in this project, make sure to also take a look at [this document][technology README], where you can find a list of concepts you need to familiarize yourself with before you can contribute to this repository.

## Join our Discord

Our contributors gather, communicate, learn through, and otherwise collaborate through our Discord channel. To join, simply follow [this invitation link][Discord invitation]. In this Discord channel, you can also post bugs, suggest new ideas, find different useful links and resources for your learning, etc.

## Contribution workflow

All code contributions must be submitted in the form of a pull request. This request has to go through a number of automatic checks, as well as several code reviews. All of this is to ensure high integrity of our code, and to build a reliable, stable environment.

As a general outline, you should follow these contribution steps:

#### Write code and create a pull request

1. Fork the repository and create a new branch.
2. All of your commits need to be signed. The easiest way to do that is to generate a new GPG key and add it to your GitHub account. Once you've done that, you can automatically sign all your commits by adding the following to your `.gitconfig`:

```bash
[commit]
gpgsign = true
[user]
email = <Your GH account email>
name = <Your Name>
signingkey = <your_signing_key>
[gpg]
program = gpg
```

3. Open a **draft** a pull request using the pull request template, and make sure to fill in the required fields.
4. A member of the Kiroku head developer team will automatically be assigned to your pull request for review.

#### Submitting your pull request for review

5. When you are ready to submit your pull request for final review, make sure the following checks pass:

   1. CLA - You must sign our Contributor License Agreement by following the CLA bot instructions that will be posted on your PR
   1. Tests - All tests must pass before a merge of a pull request
   1. Lint - All code must pass lint checks before a merge of a pull request

6. Make sure you do not use GitHub keywords in your comments (such as `fixes`), as these can mess with worfklows and other automatic checks. To avoid this, follow the pull request template when modifying your comments.
7. Upon submission, include an explicit manual tests you performed that validates your changes work on all platforms.
8. You're now ready to submit your pull request for final evaluation. Following your submission, the assigned reviewer will examine your PR. Depending on their assessment, your request may be accepted and merged, rejected, or you might be asked to make changes to your code.

<!-- README links -->

[main README]: https://github.com/PetrCala/Kiroku/blob/master/README.md
[technology README]: https://github.com/PetrCala/Kiroku/blob/master/contributingGuides/TECHNOLOGY.md
[Discord invitation]: https://discord.gg/mv8zcQz5
