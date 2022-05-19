#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

find( { wanted => \&findFiles, }, '/' );

sub findFiles {
    print "$File::Find::name\n" if $File::Find::name =~ /^.*\.py.*$/;
}