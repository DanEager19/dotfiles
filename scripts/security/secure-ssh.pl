#!/usr/bin/perl
use strict;
use warnings;

my @str = ('PermitRootLogin');
open (my $file "<", "/etc/ssh/sshd_config") or die $!;

while ( <$file> ) {
    if (s///) {

    }
}
close();