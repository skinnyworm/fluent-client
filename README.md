[![Build Status](https://travis-ci.org/skinnyworm/fluent-client.svg?branch=master)](https://travis-ci.org/skinnyworm/fluent-client)

A fluent client Api
=================================

## Introduction
As we move more and more application logic to the client applications such as SPA and mobile applications, we often need to wrap complex restful service in a client api.

In my recent projects I have tried some Mbass service providers such as Leancloud.cn, Loopback, Parse.com. None of them has a React friendly client SDK. It seems that many of those sdks uses stateful data objects, which is not good for immutable nature of flux/redux Store. Instead of keep stateful objects all around, I would like to have a stateless api good enough to express data relations. Fluent interface seems to be a good candidate for this approach. Following are some examples

```
js:   Project.find(filter)
http: GET /projects?filter=....

js:   Project(1234).delete()
http: DELETE /projects/1234

js:   Project(1234).owner.set(userId)
http: PUT /projects/1234/owner

js:   Project(1234).task.find()
http: GET /projects/1234/tasks

js:   Project(1234).task(456).update(data)
http: PUT /projects/1234/tasks/456

```

## Problems

* Express fluent api interface by configuration and js code.
* How to encode request and decode response for an acceptable content-type.
* Customize request headers (adding access token and stats)
* Customize request params (adding access token and stats)


## Build fluent Api

## Encode request

## Decode response

## Customize request parameters

## Customize request headers
